import nodemailer, { type Transporter } from "nodemailer";
import { getAppEnv, requireAppEnv } from "../config/env.ts";

export type EmailMessage = {
  readonly to: string;
  readonly subject: string;
  readonly html: string;
  readonly text: string;
};

let sharedTransport: Transporter | undefined;

const getEmailTransport = (): Transporter => {
  if (!sharedTransport) {
    const { EMAIL_SMTP_URL } = requireAppEnv(["EMAIL_SMTP_URL"]);
    sharedTransport = nodemailer.createTransport(EMAIL_SMTP_URL);
  }

  return sharedTransport;
};

export const sendEmail = async (
  message: EmailMessage,
): Promise<string | null> => {
  const { EMAIL_FROM_ADDRESS } = requireAppEnv(["EMAIL_FROM_ADDRESS"]);
  const { EMAIL_FROM_NAME } = getAppEnv();
  const fromAddress = EMAIL_FROM_NAME
    ? { name: EMAIL_FROM_NAME, address: EMAIL_FROM_ADDRESS }
    : EMAIL_FROM_ADDRESS;

  const sendResult = await getEmailTransport().sendMail({
    from: fromAddress,
    to: message.to,
    subject: message.subject,
    text: message.text,
    html: message.html,
  });

  return sendResult.messageId ?? null;
};
