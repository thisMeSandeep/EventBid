import { createMiddleware } from "hono/factory";
import { redis } from "../lib/redis";
import type { AppEnv } from "../types/hono-env";

type RateLimitWindow = `${number} ${"s" | "m" | "h"}`;

export function rateLimit(requests: number, window: RateLimitWindow) {
  const windowSeconds = parseWindowSeconds(window);

  return createMiddleware<AppEnv>(async (c, next) => {
    const user = c.get("user");
    const key = `rl:${user.id}:${c.req.path}`;
    const count = await redis.incr(key);

    if (count === 1) {
      await redis.expire(key, windowSeconds);
    }

    if (count > requests) {
      return c.json(
        { error: { code: "RATE_LIMITED", message: "Too many requests" } },
        429,
      );
    }

    await next();
  });
}

function parseWindowSeconds(window: RateLimitWindow): number {
  const [amount, unit] = window.split(" ") as [string, "s" | "m" | "h"];
  const value = Number(amount);

  switch (unit) {
    case "s":
      return value;
    case "m":
      return value * 60;
    case "h":
      return value * 60 * 60;
  }
}
