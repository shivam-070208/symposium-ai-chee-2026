import { Queue } from "bullmq";
import { z } from "zod";
import { requireAppEnv } from "../config/env.ts";
import { parseRedisUrl } from "./redis-url.ts";

export const EMAIL_DELIVERY_QUEUE_NAME = "email-delivery";

export const EMAIL_DELIVERY_JOB_NAME = "deliver-email";
const DEFAULT_JOB_ATTEMPTS = 5;

export const emailDeliveryJobSchema = z.object({
  outboxId: z.number().int().positive(),
});

export type EmailDeliveryJob = z.infer<typeof emailDeliveryJobSchema>;

const buildEmailQueue = (): Queue<EmailDeliveryJob> => {
  const { REDIS_URL } = requireAppEnv(["REDIS_URL"]);

  return new Queue<EmailDeliveryJob>(EMAIL_DELIVERY_QUEUE_NAME, {
    connection: parseRedisUrl(REDIS_URL),
    defaultJobOptions: {
      attempts: DEFAULT_JOB_ATTEMPTS,
      backoff: { type: "exponential", delay: 10_000 },
      removeOnComplete: { age: 60 * 60, count: 1_000 },
      removeOnFail: { age: 7 * 24 * 60 * 60, count: 5_000 },
    },
  });
};

let sharedEmailQueue: Queue<EmailDeliveryJob> | undefined;

export const getEmailQueue = (): Queue<EmailDeliveryJob> => {
  sharedEmailQueue ??= buildEmailQueue();
  return sharedEmailQueue;
};

export const buildEmailDeliveryJobId = (outboxId: number): string =>
  `email-outbox-${outboxId}`;

export const enqueueEmailDelivery = async (outboxId: number): Promise<void> => {
  await getEmailQueue().add(
    EMAIL_DELIVERY_JOB_NAME,
    { outboxId },
    { jobId: buildEmailDeliveryJobId(outboxId) },
  );
};

export const retryEmailDelivery = async (outboxId: number): Promise<void> => {
  const existingJob = await getEmailQueue().getJob(
    buildEmailDeliveryJobId(outboxId),
  );

  if (existingJob) {
    await existingJob.remove();
  }

  await enqueueEmailDelivery(outboxId);
};

// The outbox row is already committed, so a queue outage must never fail the
// business action; the pending row can be re-enqueued later.
export const enqueueEmailDeliverySafely = async (
  outboxId: number,
): Promise<void> => {
  try {
    await enqueueEmailDelivery(outboxId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    console.error(
      `[email-queue] failed to enqueue outbox ${outboxId}: ${message}`,
    );
  }
};
