import { Hono } from "hono";
import {
  createProposalSchema,
  reviseProposalSchema,
  type Brief,
  type CreateProposalDto,
  type Proposal,
  type ReviseProposalDto,
} from "@eventbid/shared";
import { adapters } from "../adapters";
import { repositories } from "../db/repositories";
import { AppError } from "../lib/errors";
import { requireAuth, requireRole } from "../middleware/auth.middleware";
import { rateLimit } from "../middleware/rate-limit.middleware";
import { services } from "../services";
import type { AppEnv } from "../types/hono-env";

export const briefProposalRoutes = new Hono<AppEnv>();

// GET /briefs/:id/proposals — all proposals on a brief (host only)
briefProposalRoutes.get(
  "/:id/proposals",
  requireAuth,
  requireRole("host"),
  async (c) => {
    const user = c.get("user");
    const briefId = c.req.param("id");
    await requireOwnedBrief(briefId, user.id);

    const proposals =
      await repositories.proposals.findByBriefIdWithVenue(briefId);

    return c.json({ data: proposals });
  },
);

// POST /briefs/:id/proposals — venue rep submits a proposal
briefProposalRoutes.post(
  "/:id/proposals",
  requireAuth,
  requireRole("venue_rep"),
  rateLimit(20, "1 h"),
  async (c) => {
    const user = c.get("user");
    const briefId = c.req.param("id");
    const brief = await repositories.briefs.findById(briefId);

    if (!brief) {
      throw new AppError("NOT_FOUND", "Brief not found");
    }

    assertBriefAcceptsProposals(brief);

    const venue = await requireVenueForUser(user.id);
    const existing = await repositories.proposals.findLatestByVenueAndBrief(
      venue.id,
      briefId,
    );

    if (existing?.status === "active") {
      throw new AppError(
        "VALIDATION_ERROR",
        "An active proposal already exists — use PATCH to revise",
      );
    }

    const body = await c.req.json();
    const parsed = createProposalSchema.safeParse(body);

    if (!parsed.success) {
      throw new AppError(
        "VALIDATION_ERROR",
        parsed.error.issues[0]?.message ?? "Invalid request body",
      );
    }

    const proposal = await repositories.proposals.create({
      ...toProposalInput(parsed.data),
      briefId,
      venueId: venue.id,
    });

    await services.notification.notify(brief.hostId, "proposal.received", {
      briefId,
      proposalId: proposal.id,
    });

    await maybeEnqueueAiAnalysis(briefId);

    return c.json(proposal, 201);
  },
);

// PATCH /briefs/:id/proposals/:pid — venue rep revises their proposal
briefProposalRoutes.patch(
  "/:id/proposals/:pid",
  requireAuth,
  requireRole("venue_rep"),
  async (c) => {
    const user = c.get("user");
    const briefId = c.req.param("id");
    const proposalId = c.req.param("pid");
    const brief = await repositories.briefs.findById(briefId);

    if (!brief) {
      throw new AppError("NOT_FOUND", "Brief not found");
    }

    assertBriefAcceptsProposals(brief);

    const venue = await requireVenueForUser(user.id);
    const existing = await requireActiveVenueProposal(
      proposalId,
      briefId,
      venue.id,
    );

    const body = await c.req.json();
    const parsed = reviseProposalSchema.safeParse(body);

    if (!parsed.success) {
      throw new AppError(
        "VALIDATION_ERROR",
        parsed.error.issues[0]?.message ?? "Invalid request body",
      );
    }

    const proposal = await repositories.proposals.supersedeAndCreate(
      venue.id,
      briefId,
      toProposalInput(mergeProposalRevision(existing, parsed.data)),
    );

    await repositories.analyses.upsertStatus(briefId, "stale");

    await services.notification.notify(brief.hostId, "proposal.received", {
      briefId,
      proposalId: proposal.id,
    });

    await maybeEnqueueAiAnalysis(briefId);

    return c.json(proposal);
  },
);

// POST /briefs/:id/proposals/:pid/accept — host locks the deal on a proposal
briefProposalRoutes.post(
  "/:id/proposals/:pid/accept",
  requireAuth,
  requireRole("host"),
  async (c) => {
    const user = c.get("user");
    const briefId = c.req.param("id");
    const proposalId = c.req.param("pid");

    await requireOwnedBrief(briefId, user.id);

    await services.dealLock.lockDeal(briefId, proposalId, user.id);

    return c.json({ success: true });
  },
);

export const venueProposalRoutes = new Hono<AppEnv>();

// GET /venues/me/proposals — cursor-paginated proposals for the venue rep
venueProposalRoutes.get(
  "/me/proposals",
  requireAuth,
  requireRole("venue_rep"),
  async (c) => {
    const user = c.get("user");
    const venue = await requireVenueForUser(user.id);
    const cursor = c.req.query("cursor");
    const proposals = await repositories.proposals.findByVenueIdWithBrief(
      venue.id,
      cursor,
    );

    return c.json({
      data: proposals,
      nextCursor:
        proposals.length > 0 ? proposals[proposals.length - 1]?.id ?? null : null,
    });
  },
);

async function requireOwnedBrief(
  briefId: string,
  hostId: string,
): Promise<Brief> {
  const brief = await repositories.briefs.findById(briefId);

  if (!brief) {
    throw new AppError("NOT_FOUND", "Brief not found");
  }

  if (brief.hostId !== hostId) {
    throw new AppError("FORBIDDEN", "Not your brief");
  }

  return brief;
}

async function requireVenueForUser(userId: string) {
  const venue = await repositories.venues.findByUserId(userId);

  if (!venue) {
    throw new AppError("NOT_FOUND", "Venue profile not found");
  }

  return venue;
}

async function requireActiveVenueProposal(
  proposalId: string,
  briefId: string,
  venueId: string,
): Promise<Proposal> {
  const proposal = await repositories.proposals.findById(proposalId);

  if (
    !proposal ||
    proposal.briefId !== briefId ||
    proposal.venueId !== venueId ||
    proposal.status !== "active"
  ) {
    throw new AppError("NOT_FOUND", "Active proposal not found");
  }

  return proposal;
}

function assertBriefAcceptsProposals(brief: Brief): void {
  if (brief.status !== "open") {
    throw new AppError("BRIEF_CLOSED", "Brief is not accepting proposals");
  }

  if (brief.deadline && brief.deadline < new Date()) {
    throw new AppError("DEADLINE_PASSED", "Proposal deadline has passed");
  }
}

async function maybeEnqueueAiAnalysis(briefId: string): Promise<void> {
  const activeProposals =
    await repositories.proposals.findActiveByBriefId(briefId);

  if (activeProposals.length >= 2) {
    await adapters.queue.enqueue("ai-analysis", {
      type: "ai-analysis",
      briefId,
    });
  }
}

function toProposalInput(data: CreateProposalDto) {
  return {
    totalPrice: data.totalPrice,
    priceType: data.priceType,
    inclusions: data.inclusions,
    capacityConfirmed: data.capacityConfirmed ?? false,
    cateringType: data.cateringType,
    amenities: data.amenities,
    availabilityConfirmed: data.availabilityConfirmed ?? false,
    notes: data.notes,
  };
}

function mergeProposalRevision(
  existing: Proposal,
  revision: ReviseProposalDto,
): CreateProposalDto {
  return {
    totalPrice: revision.totalPrice ?? existing.totalPrice,
    priceType: (revision.priceType ??
      existing.priceType) as CreateProposalDto["priceType"],
    inclusions: revision.inclusions ?? existing.inclusions ?? undefined,
    capacityConfirmed:
      revision.capacityConfirmed ?? existing.capacityConfirmed,
    cateringType: (revision.cateringType ??
      existing.cateringType ??
      undefined) as CreateProposalDto["cateringType"],
    amenities: revision.amenities ?? existing.amenities ?? undefined,
    availabilityConfirmed:
      revision.availabilityConfirmed ?? existing.availabilityConfirmed,
    notes: revision.notes ?? existing.notes ?? undefined,
  };
}
