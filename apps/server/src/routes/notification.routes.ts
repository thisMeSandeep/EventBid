import { Hono } from "hono";
import { repositories } from "../db/repositories";
import { requireAuth } from "../middleware/auth.middleware";
import type { AppEnv } from "../types/hono-env";

export const notificationRoutes = new Hono<AppEnv>();

// GET /notifications — cursor-paginated notifications.
// Defaults to unread only (for the bell); pass ?all=true for the full list.
notificationRoutes.get("/", requireAuth, async (c) => {
  const user = c.get("user");
  const cursor = c.req.query("cursor");
  const all = c.req.query("all") === "true";
  const notifications = all
    ? await repositories.notifications.findByUserId(user.id, cursor)
    : await repositories.notifications.findUnreadByUserId(user.id, cursor);

  return c.json({
    data: notifications,
    nextCursor:
      notifications.length > 0
        ? notifications[notifications.length - 1]?.id ?? null
        : null,
  });
});

// PATCH /notifications/read-all — mark every unread notification as read
notificationRoutes.patch("/read-all", requireAuth, async (c) => {
  const user = c.get("user");
  await repositories.notifications.markAllRead(user.id);

  return c.json({ success: true });
});

// PATCH /notifications/:id/read — mark a single notification as read
notificationRoutes.patch("/:id/read", requireAuth, async (c) => {
  const user = c.get("user");
  await repositories.notifications.markRead(c.req.param("id"), user.id);

  return c.json({ success: true });
});
