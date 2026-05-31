const PLACEHOLDER_REDIS_HOSTS = new Set(["example-redis.upstash.io"]);

const LOCAL_DEV_REDIS_URL = "redis://127.0.0.1:6379";

export function resolveRedisUrl(rawUrl: string, nodeEnv: string): string {
  let parsed: URL;

  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error(
      `Invalid Redis URL "${rawUrl}". Use redis://127.0.0.1:6379 locally or a rediss:// URL from Upstash.`,
    );
  }

  if (!["redis:", "rediss:"].includes(parsed.protocol)) {
    throw new Error(
      `Redis URL must use redis:// or rediss:// (got ${parsed.protocol})`,
    );
  }

  if (PLACEHOLDER_REDIS_HOSTS.has(parsed.hostname)) {
    if (nodeEnv === "development") {
      return LOCAL_DEV_REDIS_URL;
    }

    throw new Error(
      "UPSTASH_REDIS_URL is still the placeholder. Set a real Upstash URL or REDIS_URL for local Redis.",
    );
  }

  return rawUrl;
}

export function redisOptionsFromUrl(urlString: string) {
  const parsed = new URL(urlString);
  const isTls = parsed.protocol === "rediss:";

  return {
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 6379,
    username: parsed.username || undefined,
    password: decodedPassword(parsed.password),
    tls: isTls ? {} : undefined,
    enableReadyCheck: false,
    maxRetriesPerRequest: null,
    lazyConnect: true,
    retryStrategy(times: number) {
      if (times > 10) {
        return null;
      }

      return Math.min(times * 200, 2_000);
    },
  };
}

function decodedPassword(password: string): string | undefined {
  if (!password) {
    return undefined;
  }

  try {
    return decodeURIComponent(password);
  } catch {
    return password;
  }
}
