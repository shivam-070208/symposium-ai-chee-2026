import type { ConnectionOptions } from "bullmq";

// Pure module: the worker and queue share it with Node's native TypeScript support.
export const parseRedisUrl = (redisUrl: string): ConnectionOptions => {
  const parsedUrl = new URL(redisUrl);

  if (parsedUrl.protocol !== "redis:" && parsedUrl.protocol !== "rediss:") {
    throw new Error("REDIS_URL must use the redis:// or rediss:// scheme");
  }

  const databasePath = parsedUrl.pathname.replace(/^\//, "");
  const databaseIndex = databasePath === "" ? 0 : Number(databasePath);

  if (!Number.isInteger(databaseIndex) || databaseIndex < 0) {
    throw new Error("REDIS_URL database index must be a non-negative integer");
  }

  return {
    host: parsedUrl.hostname,
    port: parsedUrl.port ? Number(parsedUrl.port) : 6379,
    db: databaseIndex,
    maxRetriesPerRequest: null,
    ...(parsedUrl.username
      ? { username: decodeURIComponent(parsedUrl.username) }
      : {}),
    ...(parsedUrl.password
      ? { password: decodeURIComponent(parsedUrl.password) }
      : {}),
    ...(parsedUrl.protocol === "rediss:" ? { tls: {} } : {}),
  };
};
