import type { LevelWithSilent, Logger as PinoLogger } from "pino";

export type Logger = PinoLogger;
export type LogLevel = LevelWithSilent;

export interface CreateLoggerOptions {
  name: string;
  level?: LogLevel;
  /** Node only — pretty-print logs in development. Defaults to NODE_ENV !== "production". */
  pretty?: boolean;
}
