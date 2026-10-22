import { requireAppEnv } from "../config/env.ts";
import {
  findEmailOutboxById,
  markEmailOutboxFailed,
  markEmailOutboxSent,
  recordEmailOutboxAttemptFailure,
  redactEmailOutboxPayload,
} from "./email-outbox.repository.ts";
import {
  renderEmailTemplate,
  templateRedactsPayloadAfterSend,
} from "./email-templates.ts";
import { sendEmail } from "./email-transport.ts";

const MAX_SAFE_ERROR_LENGTH = 500;

const toSafeError = (error: unknown): string => {
  const message =
    error instanceof Error && error.message
      ? error.message
      : "Unknown email delivery error";

  return message.slice(0, MAX_SAFE_ERROR_LENGTH);
};

export const deliverOutboxEmail = async (
  outboxId: number,
  attemptNumber: number,
  maxAttempts: number,
): Promise<void> => {
  const outboxRecord = await findEmailOutboxById(outboxId);

  if (!outboxRecord || outboxRecord.status === "sent") {
    return;
  }

  try {
    const { APP_BASE_URL } = requireAppEnv(["APP_BASE_URL"]);
    const renderedEmail = renderEmailTemplate(
      outboxRecord.templateKey,
      outboxRecord.payload,
      { baseUrl: APP_BASE_URL },
    );

    const providerMessageId = await sendEmail({
      to: outboxRecord.recipient,
      ...renderedEmail,
    });

    await markEmailOutboxSent(outboxRecord.id, providerMessageId);

    if (templateRedactsPayloadAfterSend(outboxRecord.templateKey)) {
      await redactEmailOutboxPayload(outboxRecord.id);
    }
  } catch (error) {
    const safeError = toSafeError(error);

    if (attemptNumber >= maxAttempts) {
      await markEmailOutboxFailed(outboxRecord.id, safeError);
    } else {
      await recordEmailOutboxAttemptFailure(outboxRecord.id, safeError);
    }

    throw error;
  }
};
