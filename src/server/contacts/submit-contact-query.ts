import type { ResultSetHeader } from "mysql2";
import { withTransaction } from "../db/client.ts";
import type { ContactCreateInput } from "../validation/contact.schema.ts";

export type ContactQuerySubmission = {
  readonly queryId: number;
  readonly outboxId: number;
};

export const submitContactQuery = async (
  input: ContactCreateInput,
): Promise<ContactQuerySubmission> =>
  withTransaction(async (transaction) => {
    const [queryResult] = await transaction.execute<ResultSetHeader>(
      `INSERT INTO contact_queries
        (name, email, subject, message, status)
       VALUES (?, ?, ?, ?, 'queried')`,
      [input.name, input.email, input.subject, input.message],
    );

    const queryId = Number(queryResult.insertId);

    const [outboxResult] = await transaction.execute<ResultSetHeader>(
      `INSERT INTO email_outbox
        (registration_id, contact_query_id, recipient, template_key,
         payload_json, status)
       VALUES (NULL, ?, ?, 'contact_query_received', ?, 'pending')`,
      [
        queryId,
        input.email,
        JSON.stringify({ name: input.name, subject: input.subject }),
      ],
    );

    return { queryId, outboxId: Number(outboxResult.insertId) };
  });
