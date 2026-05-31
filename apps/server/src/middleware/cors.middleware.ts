import { cors } from "hono/cors";
import { env } from "../lib/env";

export const corsMiddleware = cors({
  origin: env.FRONTEND_URL,
  credentials: true,
  allowHeaders: [
    "Content-Type",
    "Authorization",
    "Cookie",
    "Last-Event-ID",
    "X-CSRF-Token",
    "X-Requested-With",
  ],
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
});
