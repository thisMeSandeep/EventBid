import pino from "pino/browser";
import type { CreateLoggerOptions, Logger } from "./types";

export function createLogger(options: CreateLoggerOptions): Logger {
  return pino({
    name: options.name,
    level: options.level ?? "info",
    browser: {
      asObject: true,
    },
  });
}
