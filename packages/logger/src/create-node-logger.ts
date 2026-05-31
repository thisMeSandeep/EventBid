import pino from "pino";
import type { CreateLoggerOptions, Logger } from "./types";

export function createLogger(options: CreateLoggerOptions): Logger {
  const level = options.level ?? "info";
  const usePretty =
    options.pretty ??
    (typeof process !== "undefined" && process.env.NODE_ENV !== "production");

  if (usePretty) {
    return pino({
      name: options.name,
      level,
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
        },
      },
    });
  }

  return pino({
    name: options.name,
    level,
  });
}
