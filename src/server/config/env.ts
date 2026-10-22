import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_BASE_URL: z.url().optional(),
  DATABASE_URL: z.string().min(1).optional(),
  DB_CONNECTION_LIMIT: z.coerce.number().int().min(1).max(100).optional(),
  ADMIN_EMAIL: z.email().optional(),
  ADMIN_PASSWORD_HASH: z.string().min(1).optional(),
  ADMIN_SESSION_SECRET: z.string().min(32).optional(),
  AWS_REGION: z.string().min(1).optional(),
  AWS_S3_BUCKET: z.string().min(1).optional(),
  EMAIL_PROVIDER_API_KEY: z.string().min(1).optional(),
  EMAIL_FROM_ADDRESS: z.email().optional(),
});

export type AppEnv = z.infer<typeof envSchema>;

const parseAppEnv = (): AppEnv => {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    // Messages name variables only, never values.
    const issueSummary = parsed.error.issues
      .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment configuration: ${issueSummary}`);
  }

  return parsed.data;
};

let cachedAppEnv: AppEnv | undefined;

export const getAppEnv = (): AppEnv => {
  cachedAppEnv ??= parseAppEnv();
  return cachedAppEnv;
};

export const requireAppEnv = <TKey extends keyof AppEnv>(
  keys: readonly TKey[],
): Readonly<Record<TKey, NonNullable<AppEnv[TKey]>>> => {
  const appEnv = getAppEnv();

  for (const key of keys) {
    if (appEnv[key] === undefined) {
      throw new Error(`Missing required environment variable: ${String(key)}`);
    }
  }

  return appEnv as Readonly<Record<TKey, NonNullable<AppEnv[TKey]>>>;
};
