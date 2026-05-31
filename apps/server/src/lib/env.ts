import { z } from "zod";
import { resolveRedisUrl } from "./redis-url";

const envSchema = z
  .object({
    DATABASE_URL: z.string().min(1),
    DATABASE_SSL: z.enum(["true", "false"]).optional(),
    DATABASE_POOL_SIZE: z.coerce.number().int().positive().optional(),
    DATABASE_IDLE_TIMEOUT: z.coerce.number().int().positive().optional(),
    DATABASE_CONNECT_TIMEOUT: z.coerce.number().int().positive().optional(),
    REDIS_URL: z.string().min(1).optional(),
    UPSTASH_REDIS_URL: z.string().min(1).optional(),
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.string().min(1),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    AI_GATEWAY_API_KEY: z.string().min(1),
    AI_GATEWAY_BASE_URL: z.string().optional(),
    AI_GENERATION_MODEL: z.string().min(1),
    AI_EMBEDDING_MODEL: z.string().min(1),
    RESEND_API_KEY: z.string().min(1),
    EMAIL_FROM: z.string().min(1),
    CLOUDINARY_CLOUD_NAME: z.string().min(1),
    CLOUDINARY_API_KEY: z.string().min(1),
    CLOUDINARY_API_SECRET: z.string().min(1),
    FRONTEND_URL: z.string().url(),
    LOG_LEVEL: z
      .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
      .optional(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    PORT: z.coerce.number().int().positive().default(3001),
  })
  .refine((data) => Boolean(data.REDIS_URL ?? data.UPSTASH_REDIS_URL), {
    message: "Set REDIS_URL (local) or UPSTASH_REDIS_URL (Upstash)",
  });

function parseEnv() {
  const parsed = envSchema.parse(process.env);
  const redisUrlRaw = parsed.REDIS_URL ?? parsed.UPSTASH_REDIS_URL!;

  return {
    ...parsed,
    REDIS_URL: resolveRedisUrl(redisUrlRaw, parsed.NODE_ENV),
  };
}

export const env = parseEnv();
export type Env = typeof env;
