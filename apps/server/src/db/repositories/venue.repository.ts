import {
  and,
  eq,
  gte,
  inArray,
  isNotNull,
  sql,
} from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type {
  CreateVenueInput,
  CreateVenuePhotoInput,
  UpdateVenueInput,
  Venue,
  VenuePhoto,
} from "@eventbid/shared";
import { venuePhotos, venues } from "../schema";

export type VenueEmbeddingScore = { venueId: string; score: number };

export class VenueRepository {
  constructor(private readonly db: PostgresJsDatabase) {}

  async findById(id: string): Promise<Venue | null> {
    const rows = await this.db
      .select()
      .from(venues)
      .where(eq(venues.id, id))
      .limit(1);

    return rows[0] ?? null;
  }

  async findByUserId(userId: string): Promise<Venue | null> {
    const rows = await this.db
      .select()
      .from(venues)
      .where(eq(venues.userId, userId))
      .limit(1);

    return rows[0] ?? null;
  }

  async create(input: CreateVenueInput & { userId: string }): Promise<Venue> {
    const rows = await this.db
      .insert(venues)
      .values(input)
      .returning();

    return rows[0]!;
  }

  async update(id: string, input: UpdateVenueInput): Promise<Venue> {
    const rows = await this.db
      .update(venues)
      .set(input)
      .where(eq(venues.id, id))
      .returning();

    return rows[0]!;
  }

  async findByHardFilters(params: {
    city: string;
    minCapacity: number;
    eventType: string;
  }): Promise<Venue[]> {
    const { city, minCapacity, eventType } = params;

    return this.db
      .select()
      .from(venues)
      .where(
        and(
          eq(venues.city, city),
          gte(venues.maxCapacity, minCapacity),
          isNotNull(venues.embedding),
          sql`${eventType} = ANY(${venues.eventTypes})`,
        ),
      );
  }

  async scoreByEmbedding(
    venueIds: string[],
    embedding: number[],
  ): Promise<VenueEmbeddingScore[]> {
    if (venueIds.length === 0) {
      return [];
    }

    // pgvector accepts its text form ('[0.1,0.2,...]') cast to vector. Building
    // an ARRAY[...] of bound params yields a text[], which cannot cast to vector.
    const vectorLiteral = sql`${JSON.stringify(embedding)}::vector`;

    const rows = await this.db.execute<{ venueId: string; score: number }>(
      sql`
        SELECT
          ${venues.id} AS "venueId",
          1 - (${venues.embedding} <=> ${vectorLiteral}) AS score
        FROM ${venues}
        WHERE ${venues.embedding} IS NOT NULL
          AND ${inArray(venues.id, venueIds)}
        ORDER BY ${venues.embedding} <=> ${vectorLiteral}
      `,
    );

    return rows.map((row) => ({
      venueId: row.venueId,
      score: row.score,
    }));
  }

  async updateEmbedding(id: string, embedding: number[]): Promise<void> {
    await this.db
      .update(venues)
      .set({ embedding })
      .where(eq(venues.id, id));
  }

  async findPhotoById(
    id: string,
    venueId: string,
  ): Promise<VenuePhoto | null> {
    const rows = await this.db
      .select()
      .from(venuePhotos)
      .where(and(eq(venuePhotos.id, id), eq(venuePhotos.venueId, venueId)))
      .limit(1);

    return rows[0] ?? null;
  }

  async createPhoto(
    input: CreateVenuePhotoInput & { id?: string },
  ): Promise<VenuePhoto> {
    const rows = await this.db
      .insert(venuePhotos)
      .values(input)
      .returning();

    return rows[0]!;
  }

  async deletePhoto(id: string, venueId: string): Promise<void> {
    await this.db
      .delete(venuePhotos)
      .where(and(eq(venuePhotos.id, id), eq(venuePhotos.venueId, venueId)));
  }

  async findPhotosByVenueId(venueId: string): Promise<VenuePhoto[]> {
    return this.db
      .select()
      .from(venuePhotos)
      .where(eq(venuePhotos.venueId, venueId))
      .orderBy(venuePhotos.displayOrder, venuePhotos.createdAt);
  }
}
