import { createHash } from "node:crypto";
import type { RowDataPacket } from "mysql2";
import type { PoolConnection } from "mysql2/promise";
import type {
  AbstractStatus,
  PaymentStatus,
  RegistrationStatus,
} from "../../lib/domain.ts";
import {
  calculateFees,
  findPricingCategory,
  isEarlyBird,
  REGISTRATION_PRICING,
} from "../../lib/pricing-config.ts";
import { queryRows, withTransaction } from "../db/client.ts";
import type { AttendeeDashboardOutput } from "../validation/attendee-output.schema.ts";
import type {
  AttendeePaymentUpdateInput,
  AttendeeProfileUpdateInput,
} from "../validation/attendee.schema.ts";
import { AttendeeActionError } from "./attendee-errors.ts";

const hashToken = (token: string): string =>
  createHash("sha256").update(token).digest("hex");

const toDate = (value: Date | string | null | undefined): Date | null =>
  value ? (value instanceof Date ? value : new Date(value)) : null;

const toRequiredDate = (value: Date | string): Date =>
  value instanceof Date ? value : new Date(value);

const sliceText = (
  value: string | null | undefined,
  maximumLength: number,
): string | null => (value ? value.slice(0, maximumLength) : null);

type TokenRow = {
  expires_at: Date | string | null;
  revoked_at: Date | string | null;
};

const isUsableToken = (row: TokenRow): boolean => {
  if (row.revoked_at) {
    return false;
  }

  const expiresAt = toDate(row.expires_at);
  return !expiresAt || expiresAt.getTime() > Date.now();
};

const ATTENDEE_SELECT = `
  SELECT r.id AS registration_id, r.public_reference, r.status,
         r.wants_abstract_submission, r.submitted_at, r.created_at,
         p.full_name, p.email_normalized, p.phone, p.institution,
         p.department, p.designation, p.category,
         t.expires_at, t.revoked_at
  FROM attendee_access_tokens t
  JOIN registrations r ON r.id = t.registration_id
  JOIN participants p ON p.id = r.participant_id
  WHERE t.token_hash = ?`;

type AttendeeRow = {
  registration_id: number;
  public_reference: string;
  status: string;
  wants_abstract_submission: number | boolean;
  submitted_at: Date | string | null;
  created_at: Date | string;
  full_name: string;
  email_normalized: string;
  phone: string | null;
  institution: string | null;
  department: string | null;
  designation: string | null;
  category: string;
} & TokenRow &
  RowDataPacket;

type PaymentRow = {
  status: string;
  transaction_reference: string | null;
  reported_payment_date: Date | string | null;
  rejection_reason: string | null;
  expected_amount: string | number;
  currency: string;
  created_at: Date | string;
  updated_at: Date | string;
  verified_at: Date | string | null;
} & RowDataPacket;

type AbstractRow = {
  id: number;
  title: string;
  status: string;
  submitted_at: Date | string | null;
  created_at: Date | string;
  original_filename: string | null;
  theme_name: string | null;
} & RowDataPacket;

type ReviewRow = {
  decision: string;
  participant_comment: string | null;
  created_at: Date | string;
} & RowDataPacket;

type AuditRow = {
  created_at: Date | string;
  safe_metadata_json: string | { nextStatus?: string } | null;
} & RowDataPacket;

type TimelineEntry = {
  label: string;
  detail: string | null;
  at: Date;
};

const REGISTRATION_EVENT_LABELS: Record<string, string> = {
  pending_payment: "Registration marked pending payment",
  confirmed: "Registration confirmed",
  cancelled: "Registration cancelled",
};

const ABSTRACT_EVENT_LABELS: Record<string, string> = {
  revision_requested: "Revision requested for your abstract",
  accepted: "Abstract accepted",
  rejected: "Abstract not accepted",
};

const buildTimeline = (
  registration: {
    submittedAt: Date | null;
    createdAt: Date;
  },
  auditRows: readonly AuditRow[],
  payment: PaymentRow | null,
  abstract: { submittedAt: Date } | null,
  review: ReviewRow | null,
): TimelineEntry[] => {
  const entries: TimelineEntry[] = [];

  entries.push({
    label: "Registration submitted",
    detail: null,
    at: registration.submittedAt ?? registration.createdAt,
  });

  for (const audit of auditRows) {
    const metadata =
      typeof audit.safe_metadata_json === "string"
        ? (JSON.parse(audit.safe_metadata_json) as { nextStatus?: string })
        : audit.safe_metadata_json;
    const at = toDate(audit.created_at);
    const label = metadata?.nextStatus
      ? REGISTRATION_EVENT_LABELS[metadata.nextStatus]
      : undefined;

    if (at && label) {
      entries.push({ label, detail: null, at });
    }
  }

  if (payment) {
    entries.push({
      label: "Payment details submitted",
      detail: null,
      at: toRequiredDate(payment.created_at),
    });

    if (payment.status === "verified") {
      entries.push({
        label: "Payment verified",
        detail: null,
        at: toDate(payment.verified_at) ?? toRequiredDate(payment.updated_at),
      });
    }

    if (payment.status === "rejected") {
      entries.push({
        label: "Payment could not be verified",
        detail: sliceText(payment.rejection_reason, 500),
        at: toRequiredDate(payment.updated_at),
      });
    }
  }

  if (abstract) {
    entries.push({
      label: "Abstract submitted",
      detail: null,
      at: abstract.submittedAt,
    });
  }

  if (review) {
    const label = ABSTRACT_EVENT_LABELS[review.decision];

    if (label) {
      entries.push({
        label,
        detail: sliceText(review.participant_comment, 500),
        at: toRequiredDate(review.created_at),
      });
    }
  }

  return entries.sort((left, right) => right.at.getTime() - left.at.getTime());
};

export const loadAttendeeDashboard = async (
  token: string,
): Promise<AttendeeDashboardOutput | null> => {
  const attendeeRows = await queryRows<AttendeeRow>(ATTENDEE_SELECT, [
    hashToken(token),
  ]);
  const attendee = attendeeRows[0];

  if (!attendee || !isUsableToken(attendee)) {
    return null;
  }

  const registrationId = Number(attendee.registration_id);

  const paymentRows = await queryRows<PaymentRow>(
    `SELECT status, transaction_reference, reported_payment_date,
            rejection_reason, expected_amount, currency, created_at,
            updated_at, verified_at
     FROM payments
     WHERE registration_id = ?
     ORDER BY id DESC
     LIMIT 1`,
    [registrationId],
  );
  const payment = paymentRows[0] ?? null;

  const abstractRows = await queryRows<AbstractRow>(
    `SELECT a.title, a.status, a.submitted_at, a.created_at,
            a.original_filename, th.name AS theme_name
     FROM abstract_submissions a
     LEFT JOIN themes th ON th.id = a.theme_id
     WHERE a.registration_id = ?
     ORDER BY a.id DESC
     LIMIT 1`,
    [registrationId],
  );
  const abstract = abstractRows[0] ?? null;

  const reviewRows = abstract
    ? await queryRows<ReviewRow>(
        `SELECT decision, participant_comment, created_at
         FROM abstract_review_history
         WHERE abstract_id = ?
         ORDER BY id DESC
         LIMIT 1`,
        [abstract.id],
      )
    : [];
  const review = reviewRows[0] ?? null;

  const auditRows = await queryRows<AuditRow>(
    `SELECT created_at, safe_metadata_json
     FROM audit_logs
     WHERE entity_type = 'registration'
       AND entity_id = ?
       AND action = 'registration.status_changed'
     ORDER BY created_at ASC`,
    [String(registrationId)],
  );

  const createdAt = toRequiredDate(attendee.created_at);
  const submittedAt = toDate(attendee.submitted_at);

  return {
    profile: {
      fullName: attendee.full_name,
      email: attendee.email_normalized,
      phone: attendee.phone ?? null,
      institution: attendee.institution ?? null,
      department: attendee.department ?? null,
      designation: attendee.designation ?? null,
      category: attendee.category,
    },
    registration: {
      reference: attendee.public_reference,
      status: attendee.status as RegistrationStatus,
      wantsAbstractSubmission: Boolean(attendee.wants_abstract_submission),
      createdAt,
    },
    payment: payment
      ? {
          status: payment.status as PaymentStatus,
          transactionReference: payment.transaction_reference ?? null,
          reportedPaymentDate: toDate(payment.reported_payment_date),
          rejectionReason: sliceText(payment.rejection_reason, 500),
          expectedAmount: Number(payment.expected_amount),
          currency: payment.currency,
          submittedAt: toRequiredDate(payment.created_at),
          verifiedAt: toDate(payment.verified_at),
        }
      : null,
    abstract: abstract
      ? {
          title: abstract.title,
          themeName: abstract.theme_name ?? null,
          status: abstract.status as AbstractStatus,
          participantComment: sliceText(review?.participant_comment, 2000),
          submittedAt:
            toDate(abstract.submitted_at) ?? toRequiredDate(abstract.created_at),
          fileName: abstract.original_filename ?? null,
        }
      : null,
    timeline: buildTimeline(
      { submittedAt, createdAt },
      auditRows,
      payment,
      abstract
        ? {
            submittedAt:
              toDate(abstract.submitted_at) ??
              toRequiredDate(abstract.created_at),
          }
        : null,
      review,
    ),
    canEdit: attendee.status !== "confirmed" && attendee.status !== "cancelled",
  };
};

type LockRow = {
  registration_id: number;
  status: string;
  created_at: Date | string;
  participant_id: number;
  category: string;
} & TokenRow &
  RowDataPacket;

type LockedAttendee = {
  registrationId: number;
  participantId: number;
  category: string;
  registeredAt: Date;
  status: RegistrationStatus;
};

const lockAttendeeRegistration = async (
  transaction: PoolConnection,
  token: string,
): Promise<LockedAttendee> => {
  const [rows] = await transaction.execute<LockRow[]>(
    `SELECT r.id AS registration_id, r.status, r.created_at,
            p.id AS participant_id, p.category,
            t.expires_at, t.revoked_at
     FROM attendee_access_tokens t
     JOIN registrations r ON r.id = t.registration_id
     JOIN participants p ON p.id = r.participant_id
     WHERE t.token_hash = ?
     FOR UPDATE`,
    [hashToken(token)],
  );

  const row = rows[0];

  if (!row || !isUsableToken(row)) {
    throw new AttendeeActionError(
      "not_found",
      "This access link is no longer valid. Open the link in your most recent email.",
    );
  }

  if (row.status === "confirmed" || row.status === "cancelled") {
    throw new AttendeeActionError(
      "locked",
      row.status === "confirmed"
        ? "Your registration is confirmed, so these details are locked. Contact the organisers for any change."
        : "This registration was cancelled, so it can no longer be changed. Contact the organisers if you need help.",
    );
  }

  return {
    registrationId: Number(row.registration_id),
    participantId: Number(row.participant_id),
    category: row.category,
    registeredAt: toRequiredDate(row.created_at),
    status: row.status as RegistrationStatus,
  };
};

export const updateAttendeeProfile = async (
  input: AttendeeProfileUpdateInput,
): Promise<void> => {
  await withTransaction(async (transaction) => {
    const locked = await lockAttendeeRegistration(transaction, input.token);

    await transaction.execute(
      `UPDATE participants
       SET full_name = ?, phone = ?, institution = ?, department = ?, designation = ?
       WHERE id = ?`,
      [
        input.fullName,
        input.phone || null,
        input.institution || null,
        input.department || null,
        input.designation || null,
        locked.participantId,
      ],
    );
  });
};

type PaymentLockRow = {
  id: number;
  status: string;
} & RowDataPacket;

export const updateAttendeePayment = async (
  input: AttendeePaymentUpdateInput,
): Promise<void> => {
  await withTransaction(async (transaction) => {
    const locked = await lockAttendeeRegistration(transaction, input.token);

    const pricingCategory = findPricingCategory(locked.category);

    if (!pricingCategory) {
      throw new AttendeeActionError(
        "configuration",
        "The fee for your category is not configured yet. Please contact the organisers.",
      );
    }

    // The fee window is decided by when the registration was submitted, not
    // when the payment details arrive.
    const fees = calculateFees(pricingCategory, isEarlyBird(locked.registeredAt));

    const [paymentRows] = await transaction.execute<PaymentLockRow[]>(
      `SELECT id, status
       FROM payments
       WHERE registration_id = ?
       ORDER BY id DESC
       LIMIT 1
       FOR UPDATE`,
      [locked.registrationId],
    );
    const existing = paymentRows[0];

    if (existing && existing.status === "verified") {
      throw new AttendeeActionError(
        "locked",
        "Your payment has already been verified, so it can no longer be changed.",
      );
    }

    if (existing) {
      await transaction.execute(
        `UPDATE payments
         SET transaction_reference = ?, reported_payment_date = ?,
             status = 'submitted', rejection_reason = NULL
         WHERE id = ?`,
        [
          input.transactionReference,
          input.reportedPaymentDate,
          Number(existing.id),
        ],
      );
      return;
    }

    await transaction.execute(
      `INSERT INTO payments
        (registration_id, expected_amount, currency, transaction_reference,
         reported_payment_date, status)
       VALUES (?, ?, ?, ?, ?, 'submitted')`,
      [
        locked.registrationId,
        fees.total,
        REGISTRATION_PRICING.currency,
        input.transactionReference,
        input.reportedPaymentDate,
      ],
    );
  });
};
