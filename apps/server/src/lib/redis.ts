import Redis from "ioredis";
import { env } from "./env";
import { logger } from "./logger";
import { redisOptionsFromUrl } from "./redis-url";

const PLACEHOLDER_REDIS_HOSTS = new Set(["example-redis.upstash.io"]);

export const redis = new Redis(redisOptionsFromUrl(env.REDIS_URL));

const upstashHost = env.UPSTASH_REDIS_URL
  ? safeHostname(env.UPSTASH_REDIS_URL)
  : undefined;

if (
  env.NODE_ENV === "development" &&
  upstashHost &&
  PLACEHOLDER_REDIS_HOSTS.has(upstashHost)
) {
  logger.warn(
    { redisUrl: env.REDIS_URL },
    "UPSTASH_REDIS_URL is a placeholder — using local Redis. Run: docker compose up -d redis",
  );
}

export type RedisConnection = typeof redis;

function safeHostname(url: string): string | undefined {
  try {
    return new URL(url).hostname;
  } catch {
    return undefined;
  }
}

export async function connectRedis(): Promise<boolean> {
  try {
    if (redis.status !== "ready") {
      await redis.connect();
    }

    await redis.ping();
    return true;
  } catch (error) {
    logger.warn({ err: error }, "Redis ping failed");
    redis.disconnect();
    return false;
  }
}
