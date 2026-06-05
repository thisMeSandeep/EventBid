import { z } from 'zod'

const envSchema = z.object({
  // Strip any trailing slash so `${VITE_API_URL}/api/...` never produces `//api`.
  VITE_API_URL: z.url().transform((url) => url.replace(/\/+$/, '')),
  VITE_LOG_LEVEL: z
    .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent'])
    .default('info'),
})

export const env = envSchema.parse({
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL,
})
