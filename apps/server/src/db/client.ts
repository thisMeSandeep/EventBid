import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { env } from "../lib/env";

const client = postgres(env.DATABASE_URL, {
  prepare: false,
  ssl: env.DATABASE_SSL === "true" ? "require" : undefined,
  max: env.DATABASE_POOL_SIZE ?? 10,
  idle_timeout: env.DATABASE_IDLE_TIMEOUT ?? 20,
  connect_timeout: env.DATABASE_CONNECT_TIMEOUT ?? 10,
});

export const db = drizzle(client);
