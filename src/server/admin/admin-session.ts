import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { z } from "zod";
import { getAppEnv } from "../config/env.ts";

const ADMIN_SESSION_COOKIE_NAME = "aichee_admin_session";
const ADMIN_SESSION_TTL_SECONDS = 8 * 60 * 60;

const adminSessionPayloadSchema = z.object({
  email: z.email(),
  expiresAt: z.number().int().positive(),
});

export type AdminSession = z.infer<typeof adminSessionPayloadSchema>;

const signPayload = (payload: string, secret: string): string =>
  createHmac("sha256", secret).update(payload).digest("base64url");

const encodeSession = (session: AdminSession, secret: string): string => {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${signPayload(payload, secret)}`;
};

const decodeSession = (
  cookieValue: string,
  secret: string,
): AdminSession | null => {
  const [payload, signature] = cookieValue.split(".");

  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = Buffer.from(signPayload(payload, secret));
  const receivedSignature = Buffer.from(signature);

  if (
    expectedSignature.length !== receivedSignature.length ||
    !timingSafeEqual(expectedSignature, receivedSignature)
  ) {
    return null;
  }

  try {
    const parsed = adminSessionPayloadSchema.safeParse(
      JSON.parse(Buffer.from(payload, "base64url").toString("utf8")),
    );

    if (!parsed.success) {
      return null;
    }

    return parsed.data.expiresAt > Math.floor(Date.now() / 1000)
      ? parsed.data
      : null;
  } catch {
    return null;
  }
};

const usesSecureCookies = (): boolean =>
  (getAppEnv().APP_BASE_URL ?? "").startsWith("https://");

export const startAdminSession = async (email: string): Promise<void> => {
  const { ADMIN_SESSION_SECRET } = getAppEnv();

  if (!ADMIN_SESSION_SECRET) {
    throw new Error("ADMIN_SESSION_SECRET is not configured");
  }

  const expiresAt = Math.floor(Date.now() / 1000) + ADMIN_SESSION_TTL_SECONDS;
  const cookieStore = await cookies();

  cookieStore.set({
    name: ADMIN_SESSION_COOKIE_NAME,
    value: encodeSession({ email, expiresAt }, ADMIN_SESSION_SECRET),
    httpOnly: true,
    sameSite: "lax",
    secure: usesSecureCookies(),
    path: "/",
    maxAge: ADMIN_SESSION_TTL_SECONDS,
    priority: "high",
  });
};

export const clearAdminSession = async (): Promise<void> => {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE_NAME);
};

export const readAdminSession = async (): Promise<AdminSession | null> => {
  const appEnv = getAppEnv();

  if (!appEnv.ADMIN_SESSION_SECRET || !appEnv.ADMIN_EMAIL) {
    return null;
  }

  const cookieValue = (await cookies()).get(ADMIN_SESSION_COOKIE_NAME)?.value;

  if (!cookieValue) {
    return null;
  }

  const session = decodeSession(cookieValue, appEnv.ADMIN_SESSION_SECRET);

  if (
    !session ||
    session.email.toLowerCase() !== appEnv.ADMIN_EMAIL.toLowerCase()
  ) {
    return null;
  }

  return session;
};
