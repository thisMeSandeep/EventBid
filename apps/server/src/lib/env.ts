import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  DATABASE_SSL: z.enum(["true", "false"]).optional(),
  DATABASE_POOL_SIZE: z.coerce.number().int().positive().optional(),
  DATABASE_IDLE_TIMEOUT: z.coerce.number().int().positive().optional(),
  DATABASE_CONNECT_TIMEOUT: z.coerce.number().int().positive().optional(),
  UPSTASH_REDIS_URL: z.string().min(1),
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
  SENTRY_DSN: z.string().optional(),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
});

export const env = envSchema.parse(process.env);
export type Env = typeof env;
