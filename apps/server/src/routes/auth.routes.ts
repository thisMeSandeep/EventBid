import { Hono } from "hono";
import { z } from "zod";
import { sql } from "drizzle-orm";
import { auth } from "../lib/auth";
import { db } from "../db/client";
import { AppError } from "../lib/errors";

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

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["host", "venue_rep"]),
});

authRoutes.post("/auth/register", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message } },
      422,
    );
  }

  const { name, email, password, role } = parsed.data;

  // Sign up via Better Auth — returns a Response with Set-Cookie
  const signUpResponse = await auth.api.signUpEmail({
    body: { name, email, password },
    asResponse: true,
  });

  if (!signUpResponse.ok) {
    const errBody = await signUpResponse.json().catch(() => null) as { message?: string } | null;
    const message = errBody?.message ?? "Registration failed";
    throw new AppError("VALIDATION_ERROR", message);
  }

  const data = await signUpResponse.clone().json() as { user: { id: string } };
  const userId = data.user.id;

  // Set the role directly in the user table
  await db.execute(sql`UPDATE "user" SET role = ${role} WHERE id = ${userId}`);

  // Forward the response (carries the session cookie)
  return signUpResponse;
});
