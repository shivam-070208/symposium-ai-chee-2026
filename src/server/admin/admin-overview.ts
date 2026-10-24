import { queryRow, queryRows } from "../db/client.ts";
import type { RegistrationStatus } from "../../lib/domain.ts";

export type AdminOverview = {
  readonly registrationCounts: Record<RegistrationStatus, number>;
  readonly totalRegistrations: number;
  readonly abstractsToReview: number;
  readonly paymentsToReview: number;
  readonly failedEmails: number;
};

type StatusCountRow = {
  status: string;
  count: number;
};

const EMPTY_REGISTRATION_COUNTS: Record<RegistrationStatus, number> = {
  pending_payment: 0,
  confirmed: 0,
  cancelled: 0,
};

export const getAdminOverview = async (): Promise<AdminOverview> => {
  const [statusRows, abstractRow, paymentRow, emailRow] = await Promise.all([
    queryRows<StatusCountRow>(
      "SELECT status, COUNT(*) AS count FROM registrations GROUP BY status",
    ),
    queryRow<{ count: number }>(
      "SELECT COUNT(*) AS count FROM abstract_submissions WHERE status IN ('submitted', 'under_review')",
    ),
    queryRow<{ count: number }>(
      "SELECT COUNT(*) AS count FROM payments WHERE status = 'submitted'",
    ),
    queryRow<{ count: number }>(
      "SELECT COUNT(*) AS count FROM email_outbox WHERE status = 'failed'",
    ),
  ]);

  const registrationCounts = statusRows.reduce<Record<RegistrationStatus, number>>(
    (counts, row) => {
      if (row.status in counts) {
        counts[row.status as RegistrationStatus] = Number(row.count);
      }
      return counts;
    },
    { ...EMPTY_REGISTRATION_COUNTS },
  );

  return {
    registrationCounts,
    totalRegistrations: Object.values(registrationCounts).reduce(
      (total, count) => total + count,
      0,
    ),
    abstractsToReview: Number(abstractRow?.count ?? 0),
    paymentsToReview: Number(paymentRow?.count ?? 0),
    failedEmails: Number(emailRow?.count ?? 0),
  };
};
