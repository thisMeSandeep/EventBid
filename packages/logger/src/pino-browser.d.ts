declare module "pino/browser" {
  import type { Logger, LoggerOptions } from "pino";

  export default function pino(options?: LoggerOptions): Logger;
}
