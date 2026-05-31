import { Hono } from "hono";
import type { AiAnalysis } from "@eventbid/shared";
import { adapters } from "../adapters";
import { repositories } from "../db/repositories";
import { AppError } from "../lib/errors";
import { requireAuth, requireRole } from "../middleware/auth.middleware";
import { rateLimit } from "../middleware/rate-limit.middleware";
import type { AppEnv } from "../types/hono-env";

export const briefAnalysisRoutes = new Hono<AppEnv>();

// GET /briefs/:id/analysis — current AI analysis state for a brief (host only)
briefAnalysisRoutes.get(
  "/:id/analysis",
  requireAuth,
  requireRole("host"),
  async (c) => {
    const user = c.get("user");
    const briefId = c.req.param("id");
    await requireOwnedBrief(briefId, user.id);

    const analysis = await repositories.analyses.findByBriefId(briefId);

    return c.json(analysis ?? defaultAnalysis(briefId));
  },
);

// POST /briefs/:id/analysis/trigger — enqueue AI analysis (host only, 5/min)
briefAnalysisRoutes.post(
  "/:id/analysis/trigger",
  requireAuth,
  requireRole("host"),
  rateLimit(5, "1 m"),
  async (c) => {
    const user = c.get("user");
    const briefId = c.req.param("id");
    await requireOwnedBrief(briefId, user.id);

    await adapters.queue.enqueue("ai-analysis", {
      type: "ai-analysis",
      briefId,
    });

    return c.json({ status: "queued" });
  },
);

async function requireOwnedBrief(briefId: string, hostId: string): Promise<void> {
  const brief = await repositories.briefs.findById(briefId);

  if (!brief) {
    throw new AppError("NOT_FOUND", "Brief not found");
  }

  if (brief.hostId !== hostId) {
    throw new AppError("FORBIDDEN", "Not your brief");
  }
}

function defaultAnalysis(briefId: string): Pick<AiAnalysis, "briefId" | "status"> {
  return {
    briefId,
    status: "not_started",
  };
}
