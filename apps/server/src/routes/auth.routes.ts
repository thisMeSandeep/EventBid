import { Hono } from "hono";
import { auth } from "../lib/auth";

export const authRoutes = new Hono();

authRoutes.on(["GET", "POST"], "/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

authRoutes.get("/auth/me", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: { code: "UNAUTHORIZED" } }, 401);

  const { user } = session;
  return c.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
});
