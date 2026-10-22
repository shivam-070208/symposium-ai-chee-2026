import { Worker } from "bullmq";
import { getAppEnv, requireAppEnv } from "../config/env.ts";
import { deliverOutboxEmail } from "../email/deliver-outbox-email.ts";
import {
  EMAIL_DELIVERY_QUEUE_NAME,
  emailDeliveryJobSchema,
} from "./email-queue.ts";
import { parseRedisUrl } from "./redis-url.ts";

const DEFAULT_WORKER_CONCURRENCY = 5;

export const startEmailWorker = (): Worker => {
  const { REDIS_URL } = requireAppEnv(["REDIS_URL"]);
  const { EMAIL_WORKER_CONCURRENCY } = getAppEnv();

  const emailWorker = new Worker(
    EMAIL_DELIVERY_QUEUE_NAME,
    async (job) => {
      const { outboxId } = emailDeliveryJobSchema.parse(job.data);
      const maxAttempts = job.opts.attempts ?? 1;

      await deliverOutboxEmail(outboxId, job.attemptsMade + 1, maxAttempts);
    },
    {
      connection: parseRedisUrl(REDIS_URL),
      concurrency: EMAIL_WORKER_CONCURRENCY ?? DEFAULT_WORKER_CONCURRENCY,
    },
  );

  emailWorker.on("completed", (job) => {
    console.log(`[email-worker] delivered job ${job.id ?? "<unknown>"}`);
  });

  emailWorker.on("failed", (job, error) => {
    console.error(
      `[email-worker] job ${job?.id ?? "<unknown>"} failed: ${error.message}`,
    );
  });

  emailWorker.on("error", (error) => {
    console.error(`[email-worker] worker error: ${error.message}`);
  });

  return emailWorker;
};
