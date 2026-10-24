import type { RowDataPacket } from "mysql2";
import type { SqlParameter } from "../db/client.ts";
import { queryRow, queryRows, withTransaction } from "../db/client.ts";
import { enqueueEmailDeliverySafely } from "../queue/email-queue.ts";
import { writeOutboxEmail } from "../email/email-outbox-writer.ts";
import type { AdminRegistrationListInput } from "../validation/admin.schema.ts";
import type { RegistrationStatus } from "../../lib/domain.ts";
import { AdminActionError } from "./admin-errors.ts";
import { writeAuditLog } from "./write-audit-log.ts";
import { issueAccessToken } from "../registrations/issue-access-token.ts";

export type AdminRegistrationListItem = {
  readonly id: number;
  readonly reference: string;
  readonly participantName: string;
  readonly email: string;
  readonly institution: string | null;
  readonly category: string;
  readonly status: RegistrationStatus;
  readonly wantsAbstractSubmission: boolean;
  readonly totalAmount: string | null;
  readonly currency: string | null;
  readonly submittedAt: Date | null;
  readonly latestPaymentStatus: string | null;
};

export type AdminRegistrationListResult = {
  readonly items: readonly AdminRegistrationListItem[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
};

export type AdminRegistrationDetail = {
  readonly registration: {
    readonly id: number;
    readonly reference: string;
    readonly status: RegistrationStatus;
    readonly category: string;
    readonly wantsAbstractSubmission: boolean;
    readonly baseAmount: string | null;
    readonly taxAmount: string | null;
    readonly totalAmount: string | null;
    readonly currency: string | null;
    readonly submittedAt: Date | null;
    readonly createdAt: Date;
  };
  readonly participant: {
    readonly id: number;
    readonly fullName: string;
    readonly email: string;
    readonly phone: string | null;
    readonly institution: string | null;
    readonly department: string | null;
    readonly designation: string | null;
  };
  readonly payments: readonly AdminPaymentSummary[];
  readonly abstracts: readonly AdminAbstractSummary[];
  readonly emails: readonly AdminOutboxSummary[];
};

type AdminPaymentSummary = {
  readonly id: number;
  readonly expectedAmount: string;
  readonly currency: string;
  readonly transactionReference: string | null;
  readonly reportedPaymentDate: Date | null;
  readonly status: string;
  readonly verifiedBy: string | null;
  readonly verifiedAt: Date | null;
  readonly rejectionReason: string | null;
  readonly hasProof: boolean;
  readonly createdAt: Date;
};

type AdminAbstractSummary = {
  readonly id: number;
  readonly title: string;
  readonly themeName: string | null;
  readonly status: string;
  readonly submittedAt: Date | null;
  readonly createdAt: Date;
};

type AdminOutboxSummary = {
  readonly id: number;
  readonly templateKey: string;
  readonly status: string;
  readonly attempts: number;
  readonly createdAt: Date;
  readonly sentAt: Date | null;
  readonly lastErrorSafe: string | null;
};

type RegistrationListRow = {
  id: number;
  public_reference: string;
  full_name: string;
  email_normalized: string;
  institution: string | null;
  category: string;
  status: string;
  wants_abstract_submission: number;
  total_amount: string | null;
  currency: string | null;
  submitted_at: Date | null;
  latest_payment_status: string | null;
};

type RegistrationDetailRow = {
  id: number;
  public_reference: string;
  status: string;
  category: string;
  wants_abstract_submission: number;
  base_amount: string | null;
  tax_amount: string | null;
  total_amount: string | null;
  currency: string | null;
  submitted_at: Date | null;
  created_at: Date;
  participant_id: number;
  full_name: string;
  email_normalized: string;
  phone: string | null;
  institution: string | null;
  department: string | null;
  designation: string | null;
};

type FilterSql = {
  readonly where: string;
  readonly params: readonly SqlParameter[];
};

const buildRegistrationFilters = (
  input: AdminRegistrationListInput,
): FilterSql => {
  const clauses: string[] = [];
  const params: SqlParameter[] = [];

  if (input.search) {
    const searchTerm = `%${input.search}%`;
    clauses.push(
      "(p.full_name LIKE ? OR p.email_normalized LIKE ? OR r.public_reference LIKE ? OR p.institution LIKE ?)",
    );
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  if (input.status) {
    clauses.push("r.status = ?");
    params.push(input.status);
  }

  if (input.category) {
    clauses.push("p.category = ?");
    params.push(input.category);
  }

  if (input.submittedFrom) {
    clauses.push("r.submitted_at >= ?");
    params.push(`${input.submittedFrom} 00:00:00`);
  }

  if (input.submittedTo) {
    clauses.push("r.submitted_at < DATE_ADD(?, INTERVAL 1 DAY)");
    params.push(`${input.submittedTo} 00:00:00`);
  }

  return {
    where: clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "",
    params,
  };
};

const toListItems = (
  rows: readonly RegistrationListRow[],
): AdminRegistrationListItem[] =>
  rows.map((row) => ({
    id: Number(row.id),
    reference: row.public_reference,
    participantName: row.full_name,
    email: row.email_normalized,
    institution: row.institution,
    category: row.category,
    status: row.status as RegistrationStatus,
    wantsAbstractSubmission: Boolean(row.wants_abstract_submission),
    totalAmount: row.total_amount,
    currency: row.currency,
    submittedAt: row.submitted_at,
    latestPaymentStatus: row.latest_payment_status,
  }));

export const listAdminRegistrations = async (
  input: AdminRegistrationListInput,
): Promise<AdminRegistrationListResult> => {
  const { where, params } = buildRegistrationFilters(input);
  const offset = (input.page - 1) * input.pageSize;

  const [rows, countRow] = await Promise.all([
    queryRows<RegistrationListRow>(
      `SELECT
         r.id, r.public_reference, r.status, r.wants_abstract_submission,
         r.total_amount, r.currency, r.submitted_at,
         p.full_name, p.email_normalized, p.institution, p.category,
         (SELECT pay.status
          FROM payments pay
          WHERE pay.registration_id = r.id
          ORDER BY pay.id DESC
          LIMIT 1) AS latest_payment_status
       FROM registrations r
       JOIN participants p ON p.id = r.participant_id
       ${where}
       ORDER BY COALESCE(r.submitted_at, r.created_at) DESC, r.id DESC
       LIMIT ? OFFSET ?`,
      [...params, input.pageSize, offset],
    ),
    queryRow<{ total: number }>(
      `SELECT COUNT(*) AS total
       FROM registrations r
       JOIN participants p ON p.id = r.participant_id
       ${where}`,
      params,
    ),
  ]);

  return {
    items: toListItems(rows),
    total: Number(countRow?.total ?? 0),
    page: input.page,
    pageSize: input.pageSize,
  };
};

const toPaymentSummary = (row: {
  id: number;
  expected_amount: string;
  currency: string;
  transaction_reference: string | null;
  reported_payment_date: Date | null;
  status: string;
  verified_by: string | null;
  verified_at: Date | null;
  rejection_reason: string | null;
  proof_s3_key: string | null;
  created_at: Date;
}): AdminPaymentSummary => ({
  id: Number(row.id),
  expectedAmount: row.expected_amount,
  currency: row.currency,
  transactionReference: row.transaction_reference,
  reportedPaymentDate: row.reported_payment_date,
  status: row.status,
  verifiedBy: row.verified_by,
  verifiedAt: row.verified_at,
  rejectionReason: row.rejection_reason,
  hasProof: Boolean(row.proof_s3_key),
  createdAt: row.created_at,
});

const toAbstractSummary = (row: {
  id: number;
  title: string;
  theme_name: string | null;
  status: string;
  submitted_at: Date | null;
  created_at: Date;
}): AdminAbstractSummary => ({
  id: Number(row.id),
  title: row.title,
  themeName: row.theme_name,
  status: row.status,
  submittedAt: row.submitted_at,
  createdAt: row.created_at,
});

const toOutboxSummary = (row: {
  id: number;
  template_key: string;
  status: string;
  attempts: number;
  created_at: Date;
  sent_at: Date | null;
  last_error_safe: string | null;
}): AdminOutboxSummary => ({
  id: Number(row.id),
  templateKey: row.template_key,
  status: row.status,
  attempts: Number(row.attempts),
  createdAt: row.created_at,
  sentAt: row.sent_at,
  lastErrorSafe: row.last_error_safe,
});

export const findAdminRegistrationById = async (
  registrationId: number,
): Promise<AdminRegistrationDetail | null> => {
  const row = await queryRow<RegistrationDetailRow>(
    `SELECT
       r.id, r.public_reference, r.status, r.wants_abstract_submission,
       r.base_amount, r.tax_amount, r.total_amount, r.currency,
       r.submitted_at, r.created_at,
       p.id AS participant_id, p.full_name, p.email_normalized, p.phone,
       p.institution, p.department, p.designation, p.category
     FROM registrations r
     JOIN participants p ON p.id = r.participant_id
     WHERE r.id = ?`,
    [registrationId],
  );

  if (!row) {
    return null;
  }

  const [paymentRows, abstractRows, emailRows] = await Promise.all([
    queryRows<Parameters<typeof toPaymentSummary>[0]>(
      `SELECT id, expected_amount, currency, transaction_reference,
              reported_payment_date, status, verified_by, verified_at,
              rejection_reason, proof_s3_key, created_at
       FROM payments
       WHERE registration_id = ?
       ORDER BY id DESC`,
      [registrationId],
    ),
    queryRows<Parameters<typeof toAbstractSummary>[0]>(
      `SELECT a.id, a.title, a.status, a.submitted_at, a.created_at,
              t.name AS theme_name
       FROM abstract_submissions a
       LEFT JOIN themes t ON t.id = a.theme_id
       WHERE a.registration_id = ?
       ORDER BY a.id DESC`,
      [registrationId],
    ),
    queryRows<Parameters<typeof toOutboxSummary>[0]>(
      `SELECT id, template_key, status, attempts, created_at, sent_at,
              last_error_safe
       FROM email_outbox
       WHERE registration_id = ?
       ORDER BY id DESC`,
      [registrationId],
    ),
  ]);

  return {
    registration: {
      id: Number(row.id),
      reference: row.public_reference,
      status: row.status as RegistrationStatus,
      category: row.category,
      wantsAbstractSubmission: Boolean(row.wants_abstract_submission),
      baseAmount: row.base_amount,
      taxAmount: row.tax_amount,
      totalAmount: row.total_amount,
      currency: row.currency,
      submittedAt: row.submitted_at,
      createdAt: row.created_at,
    },
    participant: {
      id: Number(row.participant_id),
      fullName: row.full_name,
      email: row.email_normalized,
      phone: row.phone,
      institution: row.institution,
      department: row.department,
      designation: row.designation,
    },
    payments: paymentRows.map(toPaymentSummary),
    abstracts: abstractRows.map(toAbstractSummary),
    emails: emailRows.map(toOutboxSummary),
  };
};

type StatusUpdateInput = {
  readonly registrationId: number;
  readonly status: RegistrationStatus;
  readonly message?: string;
  readonly actorEmail: string;
};

type StatusLockRow = {
  status: string;
  public_reference: string;
  full_name: string;
  email_normalized: string;
} & RowDataPacket;

type StatusUpdateResult = {
  readonly status: RegistrationStatus;
  readonly changed: boolean;
  readonly emailQueued: boolean;
};

export const updateRegistrationStatus = async (
  input: StatusUpdateInput,
): Promise<StatusUpdateResult> => {
  const result = await withTransaction(async (transaction) => {
    const [rows] = await transaction.execute<StatusLockRow[]>(
      `SELECT r.status, r.public_reference, p.full_name, p.email_normalized
       FROM registrations r
       JOIN participants p ON p.id = r.participant_id
       WHERE r.id = ?
       FOR UPDATE`,
      [input.registrationId],
    );

    const currentRegistration = rows[0];

    if (!currentRegistration) {
      throw new AdminActionError("not_found", "Registration not found");
    }

    if (currentRegistration.status === input.status) {
      return {
        status: input.status,
        changed: false,
        outboxId: null,
      };
    }

    await transaction.execute(
      "UPDATE registrations SET status = ? WHERE id = ?",
      [input.status, input.registrationId],
    );

    let outboxId: number | null = null;

    if (input.status === "confirmed" || input.status === "cancelled") {
      const accessPath = await issueAccessToken(
        transaction,
        input.registrationId,
      );

      outboxId = await writeOutboxEmail(transaction, {
        registrationId: input.registrationId,
        recipient: currentRegistration.email_normalized,
        templateKey: "registration_status",
        payload: {
          participantName: currentRegistration.full_name,
          registrationReference: currentRegistration.public_reference,
          status: input.status,
          ...(input.message ? { message: input.message } : {}),
          accessPath,
        },
      });
    }

    await writeAuditLog(transaction, {
      actorIdentifier: input.actorEmail,
      action: "registration.status_changed",
      entityType: "registration",
      entityId: String(input.registrationId),
      metadata: {
        previousStatus: currentRegistration.status,
        nextStatus: input.status,
        emailCreated: outboxId !== null,
      },
    });

    return { status: input.status, changed: true, outboxId };
  });

  if (result.outboxId !== null) {
    await enqueueEmailDeliverySafely(result.outboxId);
  }

  return {
    status: result.status,
    changed: result.changed,
    emailQueued: result.outboxId !== null,
  };
};
