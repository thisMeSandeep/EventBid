import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { adapters } from "../adapters";
import { repositories } from "../db/repositories";
import { requireAuth } from "../middleware/auth.middleware";
import type { AppEnv } from "../types/hono-env";

const HEARTBEAT_INTERVAL_MS = 30_000;

export const sseRoutes = new Hono<AppEnv>();

// GET /sse — authenticated real-time event stream with reconnection replay
sseRoutes.get("/", requireAuth, async (c) => {
  const user = c.get("user");
  const lastEventId = c.req.header("Last-Event-ID") ?? null;

  return streamSSE(c, async (stream) => {
    adapters.notifier.register(user.id, stream);

    if (lastEventId) {
      const missed = await repositories.notifications.findAfter(
        user.id,
        lastEventId,
      );

      for (const notification of missed) {
        await stream.writeSSE({
          id: notification.id,
          event: notification.type,
          data: JSON.stringify({
            briefId: notification.briefId,
            proposalId: notification.proposalId,
            venueId: notification.venueId,
          }),
        });
      }
    }

    const heartbeat = setInterval(() => {
      void stream.writeSSE({ event: "heartbeat", data: "" });
    }, HEARTBEAT_INTERVAL_MS);

    stream.onAbort(() => {
      clearInterval(heartbeat);
      adapters.notifier.unregister(user.id);
    });
  });
});
