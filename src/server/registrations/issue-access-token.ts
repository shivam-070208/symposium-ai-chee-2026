import type { ResultSetHeader } from "mysql2";
import type { PoolConnection } from "mysql2/promise";
import { generateAccessToken } from "./access-token.ts";

export const issueAccessToken = async (
  transaction: PoolConnection,
  registrationId: number,
): Promise<string> => {
  const accessToken = generateAccessToken();

  const [insertResult] = await transaction.execute<ResultSetHeader>(
    `INSERT INTO attendee_access_tokens (registration_id, token_hash)
     VALUES (?, ?)`,
    [registrationId, accessToken.tokenHash],
  );

  // Rotate older links so each email carries exactly one usable token.
  await transaction.execute(
    `UPDATE attendee_access_tokens
     SET revoked_at = UTC_TIMESTAMP(6), replaced_by_id = ?
     WHERE registration_id = ? AND revoked_at IS NULL AND id <> ?`,
    [insertResult.insertId, registrationId, insertResult.insertId],
  );

  return accessToken.accessPath;
};
