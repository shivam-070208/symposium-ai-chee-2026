import type { SqlParameter } from "../db/client.ts";
import { executeStatement, queryRow, queryRows, withTransaction } from "../db/client.ts";
import { retryEmailDelivery } from "../queue/email-queue.ts";
import { findEmailOutboxById } from "../email/email-outbox.repository.ts";
import type { EmailOutboxStatus } from "../../lib/domain.ts";
import type { AdminEmailListInput } from "../validation/admin.schema.ts";
import { AdminActionError } from "./admin-errors.ts";
import { writeAuditLog } from "./write-audit-log.ts";

export type AdminOutboxListItem = {
  readonly id: number;
  readonly registrationId: number | null;
  readonly recipient: string;
  readonly templateKey: string;
  readonly status: EmailOutboxStatus;
  readonly attempts: number;
  readonly createdAt: Date;
  readonly sentAt: Date | null;
  readonly lastErrorSafe: string | null;
};

export type AdminOutboxListResult = {
  readonly items: readonly AdminOutboxListItem[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
};

const REDACTED_PAYLOAD_SENTINEL = "redacted";

type OutboxDbRow = {
  id: number;
  registration_id: number | null;
  recipient: string;
  template_key: string;
  status: string;
  attempts: number;
  created_at: Date;
  sent_at: Date | null;
  last_error_safe: string | null;
};

const toOutboxListItem = (row: OutboxDbRow): AdminOutboxListItem => ({
  id: Number(row.id),
  registrationId:
    row.registration_id === null ? null : Number(row.registration_id),
  recipient: row.recipient,
  templateKey: row.template_key,
  status: row.status as EmailOutboxStatus,
  attempts: Number(row.attempts),
  createdAt: row.created_at,
  sentAt: row.sent_at,
  lastErrorSafe: row.last_error_safe,
});

const buildOutboxFilters = (
  input: AdminEmailListInput,
): { where: string; params: readonly SqlParameter[] } => {
  if (input.status) {
    return {
      where: "WHERE o.status = ?",
      params: [input.status],
    };
  }

  return { where: "", params: [] };
};

export const listOutboxEmails = async (
  input: AdminEmailListInput,
): Promise<AdminOutboxListResult> => {
  const { where, params } = buildOutboxFilters(input);
  const offset = (input.page - 1) * input.pageSize;

  const [rows, countRow] = await Promise.all([
    queryRows<OutboxDbRow>(
      `SELECT o.id, o.registration_id, o.recipient, o.template_key, o.status,
              o.attempts, o.created_at, o.sent_at, o.last_error_safe
       FROM email_outbox o
       ${where}
       ORDER BY o.id DESC
       LIMIT ? OFFSET ?`,
      [...params, input.pageSize, offset],
    ),
    queryRow<{ total: number }>(
      `SELECT COUNT(*) AS total
       FROM email_outbox o
       ${where}`,
      params,
    ),
  ]);

  return {
    items: rows.map(toOutboxListItem),
    total: Number(countRow?.total ?? 0),
    page: input.page,
    pageSize: input.pageSize,
  };
};

const isRedactedEmailPayload = (payload: unknown): boolean =>
  typeof payload === "object" &&
  payload !== null &&
  REDACTED_PAYLOAD_SENTINEL in payload &&
  (payload as { redacted?: unknown }).redacted === true;

export const retryOutboxEmail = async (input: {
  readonly outboxId: number;
  readonly actorEmail: string;
}): Promise<void> => {
  const record = await findEmailOutboxById(input.outboxId);

  if (!record) {
    throw new AdminActionError("not_found", "Outbox email not found");
  }

  if (record.status !== "failed") {
    throw new AdminActionError(
      "invalid_state",
      "Only failed emails can be retried",
    );
  }

  if (isRedactedEmailPayload(record.payload)) {
    throw new AdminActionError(
      "invalid_state",
      "This email has already been sent",
    );
  }

  try {
    await executeStatement(
      `UPDATE email_outbox
       SET status = 'pending', next_attempt_at = NULL
       WHERE id = ?`,
      [input.outboxId],
    );
    await retryEmailDelivery(input.outboxId);
    await withTransaction(async (transaction) => {
      await writeAuditLog(transaction, {
        actorIdentifier: input.actorEmail,
        action: "email.retry_requested",
        entityType: "email_outbox",
        entityId: String(input.outboxId),
        metadata: { status: "pending" },
      });
    });
  } catch (error) {
    await executeStatement(
      `UPDATE email_outbox
       SET status = 'failed', next_attempt_at = NULL
       WHERE id = ?`,
      [input.outboxId],
    );
    throw error;
  }
};
