import { createLogger } from "@eventbid/logger";
import { env } from "./env";

export const logger = createLogger({
  name: "eventbid-server",
  level: env.LOG_LEVEL ?? (env.NODE_ENV === "production" ? "info" : "debug"),
  pretty: env.NODE_ENV !== "production",
});
