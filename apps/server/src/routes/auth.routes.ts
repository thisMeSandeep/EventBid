import { Hono } from "hono";
import { z } from "zod";
import { sql } from "drizzle-orm";
import { APIError } from "better-auth/api";
import { auth } from "../lib/auth";
import { db } from "../db/client";
import { AppError } from "../lib/errors";
import { logger } from "../lib/logger";

export const authRoutes = new Hono();

// --- Specific routes FIRST ---
// Hono matches in registration order; the /auth/* catch-all below would
// otherwise swallow /auth/me and /auth/register and forward them to
// Better Auth's handler, which returns 404 for unknown paths.

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

  let signUpResponse: Response;
  try {
    signUpResponse = await auth.api.signUpEmail({
      body: { name, email, password },
      asResponse: true,
    });
  } catch (err) {
    if (err instanceof APIError) {
      logger.warn({ err: err.message, status: err.status }, "Better Auth signUp rejected");
      throw new AppError("VALIDATION_ERROR", err.message);
    }
    logger.error({ err }, "Better Auth signUp threw unexpected error");
    throw err;
  }

  if (!signUpResponse.ok) {
    const errBody = (await signUpResponse.clone().json().catch(() => null)) as
      | { message?: string }
      | null;
    logger.warn({ status: signUpResponse.status, body: errBody }, "signUp non-ok");
    throw new AppError("VALIDATION_ERROR", errBody?.message ?? "Registration failed");
  }

  const data = (await signUpResponse.clone().json()) as { user?: { id?: string } };
  const userId = data.user?.id;
  if (!userId) {
    logger.error({ data }, "signUp succeeded but no user.id in response");
    throw new AppError("INTERNAL_ERROR", "Registration succeeded but user id missing");
  }

  await db.execute(sql`UPDATE "user" SET role = ${role} WHERE id = ${userId}`);
  logger.info({ userId, role }, "User registered with role");

  // Forward the original response (carries Set-Cookie for the session)
  return signUpResponse;
});

// --- Better Auth catch-all LAST ---
authRoutes.on(["GET", "POST"], "/auth/*", (c) => {
  return auth.handler(c.req.raw);
});
