import nodemailer, { type Transporter } from "nodemailer";
import { getAppEnv } from "../config/env.ts";

export type EmailMessage = {
  readonly to: string;
  readonly subject: string;
  readonly html: string;
  readonly text: string;
};

let sharedTransport: Transporter | undefined;

const resolveGmailCredentials = (): {
  user: string;
  pass: string;
} | null => {
  const env = getAppEnv();
  const user = env.EMAIL_SMTP_USER?.trim();
  const pass = env.EMAIL_SMTP_APP_PASSWORD?.replace(/\s+/g, "");

  return user && pass ? { user, pass } : null;
};

const createTransport = (): Transporter => {
  const gmail = resolveGmailCredentials();

  // Keep failures fast: a blocked or unreachable SMTP port should mark the
  // outbox row failed instead of holding a worker slot for minutes.
  const timeouts = {
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  };

  // Gmail app-password config takes precedence when both values are present.
  // Google displays app passwords in groups of four; spaces are stripped.
  if (gmail) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: gmail,
      ...timeouts,
    });
  }

  const { EMAIL_SMTP_URL } = getAppEnv();

  if (EMAIL_SMTP_URL) {
    return nodemailer.createTransport(EMAIL_SMTP_URL);
  }

  throw new Error(
    "Email is not configured: set EMAIL_SMTP_USER and EMAIL_SMTP_APP_PASSWORD, or EMAIL_SMTP_URL",
  );
};

const getEmailTransport = (): Transporter => {
  sharedTransport ??= createTransport();
  return sharedTransport;
};

export const sendEmail = async (
  message: EmailMessage,
): Promise<string | null> => {
  const env = getAppEnv();
  const gmail = resolveGmailCredentials();

  // Gmail only sends as the authenticated account (or a verified alias), so
  // the Gmail address wins over EMAIL_FROM_ADDRESS for app-password setups.
  const fromAddress = gmail?.user ?? env.EMAIL_FROM_ADDRESS;

  if (!fromAddress) {
    throw new Error(
      "Missing sender address: set EMAIL_FROM_ADDRESS or EMAIL_SMTP_USER",
    );
  }

  const from = env.EMAIL_FROM_NAME
    ? { name: env.EMAIL_FROM_NAME, address: fromAddress }
    : fromAddress;

  const sendResult = await getEmailTransport().sendMail({
    from,
    to: message.to,
    subject: message.subject,
    text: message.text,
    html: message.html,
  });

  return sendResult.messageId ?? null;
};
