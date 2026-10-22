import { getDbPool } from "../db/client.ts";
import { EMAIL_DELIVERY_QUEUE_NAME } from "./email-queue.ts";
import { startEmailWorker } from "./email-worker.ts";

const emailWorker = startEmailWorker();

console.log(`[email-worker] listening on ${EMAIL_DELIVERY_QUEUE_NAME}`);

const shutdown = async (signal: string): Promise<void> => {
  console.log(`[email-worker] received ${signal}, shutting down`);
  await emailWorker.close();
  await getDbPool().end();
  process.exit(0);
};

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
