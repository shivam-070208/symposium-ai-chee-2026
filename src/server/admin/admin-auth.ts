import { compare } from "bcryptjs";
import { getAppEnv } from "../config/env.ts";

// A valid-format hash used only to keep timing similar when the email is wrong.
const FALLBACK_PASSWORD_HASH =
  "$2b$12$kkmduS81C32ktDnjGpQQruOZHvfQa0dAvasmFsVjjVSumpWlkk5kq";

export type VerifiedAdmin = {
  readonly email: string;
};

export const isAdminAuthConfigured = (): boolean => {
  const appEnv = getAppEnv();
  return Boolean(appEnv.ADMIN_EMAIL && appEnv.ADMIN_PASSWORD_HASH);
};

export const verifyAdminCredentials = async (
  email: string,
  password: string,
): Promise<VerifiedAdmin | null> => {
  const appEnv = getAppEnv();

  if (!appEnv.ADMIN_EMAIL || !appEnv.ADMIN_PASSWORD_HASH) {
    return null;
  }

  const passwordHash = appEnv.ADMIN_PASSWORD_HASH;
  let passwordMatches = false;

  try {
    passwordMatches = await compare(password, passwordHash);
  } catch {
    passwordMatches = false;
  }

  const emailMatches =
    email.toLowerCase() === appEnv.ADMIN_EMAIL.toLowerCase();

  if (!emailMatches) {
    // Run a comparison against an unrelated hash to avoid an obvious timing
    // difference between unknown emails and wrong passwords.
    await compare(password, FALLBACK_PASSWORD_HASH);
    return null;
  }

  return passwordMatches ? { email: appEnv.ADMIN_EMAIL } : null;
};
