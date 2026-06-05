import { Hono } from "hono";
import type { AiAnalysis } from "@eventbid/shared";
import { adapters } from "../adapters";
import { repositories } from "../db/repositories";
import { AppError } from "../lib/errors";
import { requireAuth, requireRole } from "../middleware/auth.middleware";
import { rateLimit } from "../middleware/rate-limit.middleware";
import type { AppEnv } from "../types/hono-env";

export const briefAnalysisRoutes = new Hono<AppEnv>();

// GET /briefs/:id/proposals/:pid/analysis — per-proposal AI analysis (host only)
briefAnalysisRoutes.get(
  "/:id/proposals/:pid/analysis",
  requireAuth,
  requireRole("host"),
  async (c) => {
    const user = c.get("user");
    const briefId = c.req.param("id");
    const proposalId = c.req.param("pid");
    await requireOwnedBrief(briefId, user.id);

    const analysis =
      await repositories.proposalAnalyses.findByProposalId(proposalId);

    return c.json(analysis ?? { proposalId, briefId, status: "pending" });
  },
);

// POST /briefs/:id/proposals/:pid/analysis/regenerate — re-run it (host, 5/min)
briefAnalysisRoutes.post(
  "/:id/proposals/:pid/analysis/regenerate",
  requireAuth,
  requireRole("host"),
  rateLimit(5, "1 m"),
  async (c) => {
    const user = c.get("user");
    const briefId = c.req.param("id");
    const proposalId = c.req.param("pid");
    await requireOwnedBrief(briefId, user.id);

    await repositories.proposalAnalyses.upsertStatus(
      proposalId,
      briefId,
      "pending",
    );
    await adapters.queue.enqueue("proposal-analysis", {
      type: "proposal-analysis",
      proposalId,
    });

    return c.json({ status: "queued" });
  },
);

// GET /briefs/:id/venue-analysis — "how to win" guide for venues (venue rep)
briefAnalysisRoutes.get(
  "/:id/venue-analysis",
  requireAuth,
  requireRole("venue_rep"),
  async (c) => {
    const briefId = c.req.param("id");
    const analysis = await repositories.briefAnalyses.findByBriefId(briefId);

    return c.json(analysis ?? { briefId, status: "pending" });
  },
);

// POST /briefs/:id/venue-analysis/regenerate — re-run it (venue rep, 5/min)
briefAnalysisRoutes.post(
  "/:id/venue-analysis/regenerate",
  requireAuth,
  requireRole("venue_rep"),
  rateLimit(5, "1 m"),
  async (c) => {
    const briefId = c.req.param("id");

    await repositories.briefAnalyses.upsertStatus(briefId, "pending");
    await adapters.queue.enqueue("brief-analysis", {
      type: "brief-analysis",
      briefId,
    });

    return c.json({ status: "queued" });
  },
);

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
