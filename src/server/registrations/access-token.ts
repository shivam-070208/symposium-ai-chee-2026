import { createHash, randomBytes } from "node:crypto";

export type GeneratedAccessToken = {
  readonly rawToken: string;
  readonly tokenHash: string;
  readonly accessPath: string;
};

// 32 random bytes render as a 43-character base64url token.
export const generateAccessToken = (): GeneratedAccessToken => {
  const rawToken = randomBytes(32).toString("base64url");

  return {
    rawToken,
    tokenHash: createHash("sha256").update(rawToken).digest("hex"),
    accessPath: `/access/${rawToken}`,
  };
};
