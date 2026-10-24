import type { ResultSetHeader } from "mysql2";
import type { PoolConnection } from "mysql2/promise";

export type NewOutboxEmail = {
  readonly registrationId: number;
  readonly recipient: string;
  readonly templateKey: string;
  readonly payload: unknown;
};

export const writeOutboxEmail = async (
  transaction: PoolConnection,
  email: NewOutboxEmail,
): Promise<number> => {
  const [result] = await transaction.execute<ResultSetHeader>(
    `INSERT INTO email_outbox
      (registration_id, recipient, template_key, payload_json, status)
     VALUES (?, ?, ?, ?, 'pending')`,
    [
      email.registrationId,
      email.recipient,
      email.templateKey,
      JSON.stringify(email.payload),
    ],
  );

  return Number(result.insertId);
};
