import type { ResultSetHeader } from "mysql2";
import { queryRow, withTransaction } from "../db/client.ts";
import type { RegistrationCreateInput } from "../validation/registration.schema.ts";
import { createRegistrationReference } from "./registration-reference.ts";
import { issueAccessToken } from "./issue-access-token.ts";

export type RegistrationCreationResult = {
  readonly registrationId: number;
  readonly reference: string;
  readonly outboxId: number | null;
  readonly isDuplicate: boolean;
};

type DuplicateKeyError = Error & { code?: string };

const PENDING_PRICING_SNAPSHOT = JSON.stringify({
  pricingStatus: "pending_organizer_confirmation",
});

const isIdempotencyKeyConflict = (error: unknown): boolean =>
  error instanceof Error &&
  (error as DuplicateKeyError).code === "ER_DUP_ENTRY" &&
  error.message.includes("uq_registrations_idempotency_key");

const findRegistrationByIdempotencyKey = async (idempotencyKey: string) => {
  const row = await queryRow<{ id: number; public_reference: string }>(
    `SELECT id, public_reference
     FROM registrations
     WHERE idempotency_key = ?
     LIMIT 1`,
    [idempotencyKey],
  );

  return row
    ? { registrationId: Number(row.id), reference: row.public_reference }
    : null;
};

const createRegistrationInTransaction = async (
  input: RegistrationCreateInput,
): Promise<RegistrationCreationResult> =>
  withTransaction(async (transaction) => {
    const [participantResult] = await transaction.execute<ResultSetHeader>(
      `INSERT INTO participants
        (full_name, email_normalized, phone, institution, department, designation, category)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        input.fullName,
        input.email,
        input.phone ?? null,
        input.institution ?? null,
        input.department ?? null,
        input.designation ?? null,
        input.category,
      ],
    );

    const registrationReference = createRegistrationReference();

    const [registrationResult] = await transaction.execute<ResultSetHeader>(
      `INSERT INTO registrations
        (public_reference, participant_id, status, wants_abstract_submission,
         base_amount, tax_amount, total_amount, currency, pricing_rule_snapshot,
         idempotency_key, submitted_at)
       VALUES (?, ?, 'pending_payment', ?, NULL, NULL, NULL, NULL, ?, ?, UTC_TIMESTAMP(6))`,
      [
        registrationReference,
        participantResult.insertId,
        input.wantsAbstractSubmission ? 1 : 0,
        PENDING_PRICING_SNAPSHOT,
        input.idempotencyKey,
      ],
    );

    const accessPath = await issueAccessToken(
      transaction,
      Number(registrationResult.insertId),
    );

    const outboxPayload = JSON.stringify({
      participantName: input.fullName,
      registrationReference,
      accessPath,
    });

    const [outboxResult] = await transaction.execute<ResultSetHeader>(
      `INSERT INTO email_outbox
        (registration_id, recipient, template_key, payload_json, status)
       VALUES (?, ?, 'registration_received', ?, 'pending')`,
      [registrationResult.insertId, input.email, outboxPayload],
    );

    return {
      registrationId: Number(registrationResult.insertId),
      reference: registrationReference,
      outboxId: Number(outboxResult.insertId),
      isDuplicate: false,
    };
  });

export const createRegistration = async (
  input: RegistrationCreateInput,
): Promise<RegistrationCreationResult> => {
  try {
    return await createRegistrationInTransaction(input);
  } catch (error) {
    if (!isIdempotencyKeyConflict(error)) {
      throw error;
    }

    const existingRegistration = await findRegistrationByIdempotencyKey(
      input.idempotencyKey,
    );

    if (!existingRegistration) {
      throw error;
    }

    return {
      ...existingRegistration,
      outboxId: null,
      isDuplicate: true,
    };
  }
};
