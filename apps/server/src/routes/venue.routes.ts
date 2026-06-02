import { Hono } from "hono";
import {
  createVenueSchema,
  updateVenueSchema,
  type UpdateVenueDto,
  type Venue,
} from "@eventbid/shared";
import { adapters } from "../adapters";
import { repositories } from "../db/repositories";
import { AppError } from "../lib/errors";
import { requireAuth, requireRole } from "../middleware/auth.middleware";
import type { AppEnv } from "../types/hono-env";

const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;

const MATCHABLE_VENUE_FIELDS = ["styleTags", "amenities", "eventTypes"] as const;

export const venueRoutes = new Hono<AppEnv>();

// GET /venues/me — venue rep's own profile
venueRoutes.get("/me", requireAuth, requireRole("venue_rep"), async (c) => {
  const user = c.get("user");
  const venue = await repositories.venues.findByUserId(user.id);

  if (!venue) {
    throw new AppError("NOT_FOUND", "Venue profile not found");
  }

  const photos = await repositories.venues.findPhotosByVenueId(venue.id);

  return c.json({ ...venue, photos });
});

// PUT /venues/me — create or update profile; re-embed when matchable fields change
venueRoutes.put("/me", requireAuth, requireRole("venue_rep"), async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const existing = await repositories.venues.findByUserId(user.id);

  if (existing) {
    const parsed = updateVenueSchema.safeParse(body);
    if (!parsed.success) {
      throw new AppError(
        "VALIDATION_ERROR",
        parsed.error.issues[0]?.message ?? "Invalid request body",
      );
    }

    const updated = await repositories.venues.update(existing.id, parsed.data);

    if (haveMatchableFieldsChanged(existing, parsed.data)) {
      await enqueueVenueEmbedding(updated.id);
    }

    return c.json(updated);
  }

  const parsed = createVenueSchema.safeParse(body);
  if (!parsed.success) {
    throw new AppError(
      "VALIDATION_ERROR",
      parsed.error.issues[0]?.message ?? "Invalid request body",
    );
  }

  const created = await repositories.venues.create({
    ...parsed.data,
    userId: user.id,
  });

  await enqueueVenueEmbedding(created.id);

  return c.json(created, 201);
});

// GET /venues/me/feed — cursor-paginated briefs matched to this venue
venueRoutes.get("/me/feed", requireAuth, requireRole("venue_rep"), async (c) => {
  const user = c.get("user");
  const venue = await repositories.venues.findByUserId(user.id);

  if (!venue) {
    throw new AppError("NOT_FOUND", "Venue profile not found");
  }

  const cursor = c.req.query("cursor");
  const matches = await repositories.briefVenueMatches.findByVenueId(
    venue.id,
    cursor,
  );

  return c.json({
    data: matches,
    nextCursor:
      matches.length > 0 ? matches[matches.length - 1]?.id ?? null : null,
  });
});

// GET /venues/:id — public venue profile (e.g. host viewing from a proposal)
venueRoutes.get("/:id", async (c) => {
  const venue = await repositories.venues.findById(c.req.param("id"));

  if (!venue) {
    throw new AppError("NOT_FOUND", "Venue not found");
  }

  const photos = await repositories.venues.findPhotosByVenueId(venue.id);

  return c.json({ ...venue, photos });
});

// POST /venues/me/photos — upload a venue photo (JPEG/PNG/WebP, max 5 MB)
venueRoutes.post(
  "/me/photos",
  requireAuth,
  requireRole("venue_rep"),
  async (c) => {
    const user = c.get("user");
    const venue = await repositories.venues.findByUserId(user.id);

    if (!venue) {
      throw new AppError("NOT_FOUND", "Venue profile not found");
    }

    const body = await c.req.parseBody();
    const file = body.file;

    if (!(file instanceof File)) {
      throw new AppError("VALIDATION_ERROR", "file field required");
    }

    if (
      !ALLOWED_PHOTO_TYPES.includes(
        file.type as (typeof ALLOWED_PHOTO_TYPES)[number],
      )
    ) {
      throw new AppError(
        "VALIDATION_ERROR",
        "Only JPEG, PNG, and WebP images are allowed",
      );
    }

    if (file.size > MAX_PHOTO_SIZE_BYTES) {
      throw new AppError("VALIDATION_ERROR", "File must be under 5 MB");
    }

    const photoId = crypto.randomUUID();
    const ext = file.type.split("/")[1] ?? "jpg";
    const key = `venues/${venue.id}/${photoId}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { publicUrl } = await adapters.storage.upload(key, buffer, file.type);

    const photo = await repositories.venues.createPhoto({
      id: photoId,
      venueId: venue.id,
      r2Key: key,
      url: publicUrl,
    });

    return c.json({ id: photo.id, url: photo.url }, 201);
  },
);

// DELETE /venues/me/photos/:pid — remove a photo from storage and the database
venueRoutes.delete(
  "/me/photos/:pid",
  requireAuth,
  requireRole("venue_rep"),
  async (c) => {
    const user = c.get("user");
    const venue = await repositories.venues.findByUserId(user.id);

    if (!venue) {
      throw new AppError("NOT_FOUND", "Venue profile not found");
    }

    const photoId = c.req.param("pid");
    const photo = await repositories.venues.findPhotoById(photoId, venue.id);

    if (!photo) {
      throw new AppError("NOT_FOUND", "Photo not found");
    }

    if (photo.r2Key) {
      await adapters.storage.deleteObject(photo.r2Key);
    }

    await repositories.venues.deletePhoto(photoId, venue.id);

    return c.body(null, 204);
  },
);

async function enqueueVenueEmbedding(venueId: string): Promise<void> {
  await adapters.queue.enqueue("venue-embedding", {
    type: "venue-embedding",
    venueId,
  });
}

function haveMatchableFieldsChanged(
  before: Venue,
  after: UpdateVenueDto,
): boolean {
  return MATCHABLE_VENUE_FIELDS.some((field) => {
    if (after[field] === undefined) {
      return false;
    }

    return (
      normalizeStringArray(before[field]) !== normalizeStringArray(after[field])
    );
  });
}

function normalizeStringArray(values: string[] | null | undefined): string {
  return JSON.stringify([...(values ?? [])].sort());
}
