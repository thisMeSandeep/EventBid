import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { z } from "zod";
import {
  createBriefSchema,
  updateBriefSchema,
  type Brief,
  type CreateBriefDto,
  type UpdateBriefDto,
} from "@eventbid/shared";
import { adapters } from "../adapters";
import { repositories } from "../db/repositories";
import { AppError } from "../lib/errors";
import { requireAuth, requireRole } from "../middleware/auth.middleware";
import { rateLimit } from "../middleware/rate-limit.middleware";
import { services } from "../services";
import type { AppEnv } from "../types/hono-env";

const improveBriefBodySchema = z.object({
  description: z.string().optional(),
  requirements: z.array(z.string()).optional(),
});

export const briefRoutes = new Hono<AppEnv>();

// POST /briefs — create brief, return quality warnings, enqueue matching
briefRoutes.post(
  "/",
  requireAuth,
  requireRole("host"),
  rateLimit(10, "1 h"),
  async (c) => {
    const user = c.get("user");
    const body = await c.req.json();
    const parsed = createBriefSchema.safeParse(body);

    if (!parsed.success) {
      throw new AppError(
        "VALIDATION_ERROR",
        parsed.error.issues[0]?.message ?? "Invalid request body",
      );
    }

    const { warnings } = await services.briefAI.checkQuality(parsed.data);

    const brief = await repositories.briefs.create({
      ...toBriefInput(parsed.data),
      hostId: user.id,
    });

    await adapters.queue.enqueue("matching", {
      type: "match-brief",
      briefId: brief.id,
    });

    return c.json({ brief, warnings }, 201);
  },
);

// GET /briefs — cursor-paginated list of the host's briefs
briefRoutes.get("/", requireAuth, requireRole("host"), async (c) => {
  const user = c.get("user");
  const cursor = c.req.query("cursor");
  const briefs = await repositories.briefs.findByHostId(user.id, cursor);

  return c.json({
    data: briefs,
    nextCursor: briefs.length > 0 ? briefs[briefs.length - 1]?.id ?? null : null,
  });
});

// GET /briefs/:id — brief detail (host owner, or a venue rep matched to it)
briefRoutes.get("/:id", requireAuth, async (c) => {
  const user = c.get("user");
  const briefId = c.req.param("id");

  if (user.role === "venue_rep") {
    const venue = await repositories.venues.findByUserId(user.id);
    if (!venue) {
      throw new AppError("NOT_FOUND", "Venue profile not found");
    }

    const match = await repositories.briefVenueMatches.findByBriefAndVenue(
      briefId,
      venue.id,
    );
    if (!match) {
      throw new AppError("FORBIDDEN", "Brief is not matched to your venue");
    }

    const brief = await repositories.briefs.findById(briefId);
    if (!brief) {
      throw new AppError("NOT_FOUND", "Brief not found");
    }

    return c.json(brief);
  }

  const brief = await requireOwnedBrief(briefId, user.id);

  return c.json(brief);
});

// PATCH /briefs/:id — update an open brief
briefRoutes.patch("/:id", requireAuth, requireRole("host"), async (c) => {
  const user = c.get("user");
  const briefId = c.req.param("id");
  const existing = await requireOwnedBrief(briefId, user.id);

  if (existing.status !== "open") {
    throw new AppError("BRIEF_CLOSED", "Brief is not open for updates");
  }

  const body = await c.req.json();
  const parsed = updateBriefSchema.safeParse(body);

  if (!parsed.success) {
    throw new AppError(
      "VALIDATION_ERROR",
      parsed.error.issues[0]?.message ?? "Invalid request body",
    );
  }

  const brief = await repositories.briefs.update(
    briefId,
    toBriefUpdateInput(parsed.data),
  );

  // Re-match when fields that feed the brief embedding or hard filter change,
  // so the brief's matches (and scores) reflect the edit.
  if (haveMatchableBriefFieldsChanged(existing, parsed.data)) {
    await adapters.queue.enqueue("matching", {
      type: "match-brief",
      briefId: brief.id,
    });
  }

  return c.json(brief);
});

// POST /briefs/:id/close — end an open brief without selecting a winner
briefRoutes.post("/:id/close", requireAuth, requireRole("host"), async (c) => {
  const user = c.get("user");
  const briefId = c.req.param("id");
  const existing = await requireOwnedBrief(briefId, user.id);

  if (existing.status !== "open") {
    throw new AppError("BRIEF_CLOSED", "Brief is not open");
  }

  const brief = await repositories.briefs.close(briefId);
  return c.json(brief);
});

// DELETE /briefs/:id — delete an open brief with no proposals
briefRoutes.delete("/:id", requireAuth, requireRole("host"), async (c) => {
  const user = c.get("user");
  const briefId = c.req.param("id");
  const existing = await requireOwnedBrief(briefId, user.id);

  if (existing.status !== "open") {
    throw new AppError("BRIEF_CLOSED", "Brief is not open for deletion");
  }

  const proposals =
    await repositories.proposals.findByBriefIdWithVenue(briefId);

  if (proposals.length > 0) {
    throw new AppError(
      "VALIDATION_ERROR",
      "Cannot delete a brief that has proposals",
    );
  }

  await repositories.briefs.delete(briefId);

  return c.body(null, 204);
});

// POST /briefs/:id/improve — stream AI-improved description via SSE
briefRoutes.post(
  "/:id/improve",
  requireAuth,
  requireRole("host"),
  rateLimit(10, "1 m"),
  async (c) => {
    const user = c.get("user");
    const brief = await requireOwnedBrief(c.req.param("id"), user.id);
    const body = await c.req.json().catch(() => ({}));
    const parsed = improveBriefBodySchema.safeParse(body);

    if (!parsed.success) {
      throw new AppError(
        "VALIDATION_ERROR",
        parsed.error.issues[0]?.message ?? "Invalid request body",
      );
    }

    const description = parsed.data.description ?? brief.description ?? "";
    const requirements = parsed.data.requirements ?? brief.requirements ?? [];

    return streamSSE(c, async (stream) => {
      for await (const chunk of services.briefAI.improveDescription(
        description,
        requirements,
      )) {
        await stream.writeSSE({ data: chunk });
      }
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

function toBriefInput(data: CreateBriefDto) {
  return {
    eventType: data.eventType,
    eventDateFrom: toDateString(data.eventDateFrom),
    eventDateTo: toDateString(data.eventDateTo),
    timeOfDay: data.timeOfDay,
    headcount: data.headcount,
    city: data.city,
    state: data.state,
    budgetMin: data.budgetMin,
    budgetMax: data.budgetMax,
    requirements: data.requirements,
    description: data.description,
    deadline: data.deadline,
  };
}

function toBriefUpdateInput(data: UpdateBriefDto) {
  return {
    ...(data.eventType !== undefined ? { eventType: data.eventType } : {}),
    ...(data.eventDateFrom !== undefined
      ? { eventDateFrom: toDateString(data.eventDateFrom) }
      : {}),
    ...(data.eventDateTo !== undefined
      ? { eventDateTo: toDateString(data.eventDateTo) }
      : {}),
    ...(data.timeOfDay !== undefined ? { timeOfDay: data.timeOfDay } : {}),
    ...(data.headcount !== undefined ? { headcount: data.headcount } : {}),
    ...(data.city !== undefined ? { city: data.city } : {}),
    ...(data.state !== undefined ? { state: data.state } : {}),
    ...(data.budgetMin !== undefined ? { budgetMin: data.budgetMin } : {}),
    ...(data.budgetMax !== undefined ? { budgetMax: data.budgetMax } : {}),
    ...(data.requirements !== undefined
      ? { requirements: data.requirements }
      : {}),
    ...(data.description !== undefined ? { description: data.description } : {}),
    ...(data.deadline !== undefined ? { deadline: data.deadline } : {}),
  };
}

function toDateString(value: Date): string {
  return value.toISOString().slice(0, 10);
}

// Fields that feed the brief embedding or the hard filter. A change to any of
// them should re-run matching so matches and scores reflect the edit.
const MATCHABLE_BRIEF_FIELDS = [
  "eventType",
  "eventDateFrom",
  "eventDateTo",
  "timeOfDay",
  "headcount",
  "city",
  "state",
  "budgetMin",
  "budgetMax",
  "requirements",
  "description",
] as const;

function haveMatchableBriefFieldsChanged(
  before: Brief,
  after: UpdateBriefDto,
): boolean {
  return MATCHABLE_BRIEF_FIELDS.some((field) => {
    const next = (after as Record<string, unknown>)[field];
    if (next === undefined) {
      return false;
    }

    const prev = (before as Record<string, unknown>)[field];
    if (Array.isArray(prev) || Array.isArray(next)) {
      return normalizeArray(prev) !== normalizeArray(next);
    }

    return String(prev ?? "") !== String(next ?? "");
  });
}

function normalizeArray(value: unknown): string {
  return JSON.stringify([...((value as string[] | null) ?? [])].sort());
}
