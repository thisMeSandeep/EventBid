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

  // Disable reverse-proxy buffering (Render/nginx) so events flush immediately
  // instead of being held — otherwise the stream appears dead in production.
  c.header("X-Accel-Buffering", "no");
  c.header("Cache-Control", "no-cache, no-transform");

  return streamSSE(c, async (stream) => {
    adapters.notifier.register(user.id, stream);

    // Flush a byte right away so proxies open the stream without waiting for the
    // first real event (the 30s heartbeat is too late for proxy timeouts).
    await stream.writeSSE({ event: "heartbeat", data: "" });

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
