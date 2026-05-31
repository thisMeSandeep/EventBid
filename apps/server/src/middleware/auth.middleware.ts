import { createMiddleware } from "hono/factory";
import { auth } from "../lib/auth";
import type { AppEnv } from "../types/hono-env";

export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: { code: "UNAUTHORIZED" } }, 401);
  c.set("user", session.user);
  await next();
});

export const requireRole = (role: "host" | "venue_rep") =>
  createMiddleware<AppEnv>(async (c, next) => {
    const user = c.get("user");
    if (!user || user.role !== role) {
      return c.json({ error: { code: "FORBIDDEN" } }, 403);
    }
    await next();
  });
