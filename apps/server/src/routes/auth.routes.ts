import { Hono } from "hono";
import { z } from "zod";
import { sql } from "drizzle-orm";
import { APIError } from "better-auth/api";
import { auth } from "../lib/auth";
import { db } from "../db/client";
import { adapters } from "../adapters";
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
  email: z.email(),
  password: z.string().min(8),
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

  const { name, email, password } = parsed.data;

  let signUpResponse: Response;
  try {
    // Account is created without a role; the user picks one next via POST /auth/role.
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

  logger.info({ email }, "User registered");

  // Forward the original response (carries Set-Cookie for the session)
  return signUpResponse;
});

const roleSchema = z.object({
  role: z.enum(["host", "venue_rep"]),
});

// One-time role assignment for the authenticated user. Roles cannot be changed
// once set, so this is a no-op-with-409 if the user already has a role.
authRoutes.post("/auth/role", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: { code: "UNAUTHORIZED" } }, 401);

  const body = await c.req.json().catch(() => null);
  const parsed = roleSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message } },
      422,
    );
  }

  if (session.user.role) {
    return c.json(
      { error: { code: "ROLE_ALREADY_SET", message: "Role has already been set" } },
      409,
    );
  }

  const { role } = parsed.data;
  await db.execute(sql`UPDATE "user" SET role = ${role} WHERE id = ${session.user.id}`);
  logger.info({ userId: session.user.id, role }, "User role set");

  // Enqueue a one-time welcome email. Don't fail role selection if enqueue fails.
  try {
    await adapters.queue.enqueue("email", {
      type: "welcome",
      email: session.user.email,
      name: session.user.name,
      role,
    });
    logger.info({ userId: session.user.id, email: session.user.email }, "Welcome email enqueued");
  } catch (err) {
    logger.error({ err, userId: session.user.id }, "Failed to enqueue welcome email");
  }

  return c.json({ role });
});

// --- Better Auth catch-all LAST ---
authRoutes.on(["GET", "POST"], "/auth/*", (c) => {
  return auth.handler(c.req.raw);
});
