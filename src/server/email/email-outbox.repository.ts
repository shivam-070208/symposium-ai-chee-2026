import { executeStatement, queryRow } from "../db/client.ts";
import type { EmailOutboxStatus } from "../../lib/domain.ts";

type EmailOutboxDbRow = {
  id: number;
  recipient: string;
  template_key: string;
  payload_json: unknown;
  status: string;
  attempts: number;
};

export type EmailOutboxRecord = {
  readonly id: number;
  readonly recipient: string;
  readonly templateKey: string;
  readonly payload: unknown;
  readonly status: EmailOutboxStatus;
  readonly attempts: number;
};

const toRecord = (row: EmailOutboxDbRow): EmailOutboxRecord => ({
  id: Number(row.id),
  recipient: row.recipient,
  templateKey: row.template_key,
  payload:
    typeof row.payload_json === "string"
      ? (JSON.parse(row.payload_json) as unknown)
      : row.payload_json,
  status: row.status as EmailOutboxStatus,
  attempts: Number(row.attempts),
});

export const findEmailOutboxById = async (
  outboxId: number,
): Promise<EmailOutboxRecord | null> => {
  const row = await queryRow<EmailOutboxDbRow>(
    `SELECT id, recipient, template_key, payload_json, status, attempts
     FROM email_outbox
     WHERE id = ?`,
    [outboxId],
  );

  return row ? toRecord(row) : null;
};

export const markEmailOutboxSent = async (
  outboxId: number,
  providerMessageId: string | null,
): Promise<void> => {
  await executeStatement(
    `UPDATE email_outbox
     SET status = 'sent',
         sent_at = UTC_TIMESTAMP(6),
         provider_message_id = ?,
         next_attempt_at = NULL,
         last_error_safe = NULL
     WHERE id = ?`,
    [providerMessageId, outboxId],
  );
};

export const recordEmailOutboxAttemptFailure = async (
  outboxId: number,
  safeError: string,
): Promise<void> => {
  await executeStatement(
    `UPDATE email_outbox
     SET attempts = attempts + 1,
         last_error_safe = ?,
         next_attempt_at = DATE_ADD(UTC_TIMESTAMP(6), INTERVAL 10 SECOND)
     WHERE id = ?`,
    [safeError, outboxId],
  );
};

export const markEmailOutboxFailed = async (
  outboxId: number,
  safeError: string,
): Promise<void> => {
  await executeStatement(
    `UPDATE email_outbox
     SET status = 'failed',
         attempts = attempts + 1,
         last_error_safe = ?,
         next_attempt_at = NULL
     WHERE id = ?`,
    [safeError, outboxId],
  );
};

// The raw attendee token lives only in the emailed link; drop it after sending.
export const redactEmailOutboxPayload = async (
  outboxId: number,
): Promise<void> => {
  await executeStatement(
    "UPDATE email_outbox SET payload_json = JSON_OBJECT('redacted', TRUE) WHERE id = ?",
    [outboxId],
  );
};
