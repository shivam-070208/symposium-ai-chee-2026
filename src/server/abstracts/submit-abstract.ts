import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { queryRow, withTransaction } from "../db/client.ts";
import type { AbstractPublicSubmitInput } from "../validation/abstract.schema.ts";

export type AbstractSubmissionFailure = "registration_not_found";

export class AbstractSubmissionError extends Error {
  readonly reason: AbstractSubmissionFailure;

  constructor(reason: AbstractSubmissionFailure, message: string) {
    super(message);
    this.name = "AbstractSubmissionError";
    this.reason = reason;
  }
}

export type AbstractSubmissionResult = {
  readonly abstractId: number;
};

const REGISTRATION_MATCH_SQL = `SELECT r.id
    FROM registrations r
    JOIN participants p ON p.id = r.participant_id
   WHERE r.public_reference = ?
     AND p.email_normalized = ?
     AND r.status <> 'cancelled'
   LIMIT 1`;

export const findRegistrationForAbstractSubmission = async (
  registrationReference: string,
  registrationEmail: string,
): Promise<number | null> => {
  const row = await queryRow<{ id: number | bigint }>(REGISTRATION_MATCH_SQL, [
    registrationReference,
    registrationEmail,
  ]);

  return row ? Number(row.id) : null;
};

export const submitAbstractSubmission = async (
  input: AbstractPublicSubmitInput,
): Promise<AbstractSubmissionResult> =>
  withTransaction(async (transaction) => {
    const [registrationRows] = await transaction.execute<RowDataPacket[]>(
      REGISTRATION_MATCH_SQL,
      [input.registrationReference, input.registrationEmail],
    );

    const registration = registrationRows[0];

    if (!registration) {
      throw new AbstractSubmissionError(
        "registration_not_found",
        "No registration matches this reference and email address. Check both values, or register first.",
      );
    }

    const registrationId = Number(registration.id);

    const [submissionResult] = await transaction.execute<ResultSetHeader>(
      `INSERT INTO abstract_submissions
        (registration_id, theme_id, title, abstract_text, s3_object_key,
         original_filename, content_type, file_size_bytes, status,
         submitted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'submitted', UTC_TIMESTAMP(6))`,
      [
        registrationId,
        input.themeId ?? null,
        input.title,
        input.abstractText ?? null,
        input.file?.s3ObjectKey ?? null,
        input.file?.originalFilename ?? null,
        input.file?.contentType ?? null,
        input.file?.sizeBytes ?? null,
      ],
    );

    const abstractId = Number(submissionResult.insertId);

    for (const [index, author] of input.authors.entries()) {
      await transaction.execute(
        `INSERT INTO abstract_authors
          (abstract_id, full_name, email, affiliation, author_order,
           is_corresponding)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          abstractId,
          author.fullName,
          author.email ?? null,
          author.affiliation ?? null,
          index + 1,
          author.isCorresponding ? 1 : 0,
        ],
      );
    }

    await transaction.execute(
      `UPDATE registrations
          SET wants_abstract_submission = 1
        WHERE id = ?`,
      [registrationId],
    );

    return { abstractId };
  });
