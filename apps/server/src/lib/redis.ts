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

/**
 * Run a Redis operation with a hard timeout so a down/over-quota Redis
 * (which can hang while ioredis buffers commands) never blocks the HTTP path.
 * Rejects if the op throws or exceeds `ms`; callers decide how to degrade.
 */
export async function withRedisTimeout<T>(
  op: () => Promise<T>,
  ms = 1_000,
): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      op(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`Redis op timed out after ${ms}ms`)),
          ms,
        );
      }),
    ]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}

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
