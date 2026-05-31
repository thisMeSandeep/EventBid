import * as Sentry from "@sentry/node";
import { env } from "./env";

let initialized = false;

export function initSentry(): void {
  if (initialized || !env.SENTRY_DSN) {
    return;
  }

  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    tracesSampleRate: env.NODE_ENV === "production" ? 0.2 : 1.0,
  });
  initialized = true;
}

export function captureJobFailure(
  error: unknown,
  extra: Record<string, unknown>,
): void {
  captureException(error, extra);
}

export function captureException(
  error: unknown,
  extra?: Record<string, unknown>,
): void {
  if (env.SENTRY_DSN) {
    Sentry.captureException(error, extra ? { extra } : undefined);
    return;
  }

  console.error("[sentry] Exception:", error, extra);
}
