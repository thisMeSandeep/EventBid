import { and, desc, eq, lt } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type {
  CreateProposalInput,
  Proposal,
} from "@eventbid/shared";
import { briefs, proposals, venues } from "../schema";

export type ProposalWithVenueRow = Proposal & {
  venueName: string;
  venueCity: string;
  venueEmail: string | null;
  venuePhone: string | null;
};

export type ProposalWithBriefRow = Proposal & {
  briefEventType: string;
  briefCity: string;
  briefDeadline: Date;
  briefStatus: string;
};

export class ProposalRepository {
  constructor(private readonly db: PostgresJsDatabase) {}

  async findById(id: string): Promise<Proposal | null> {
    const rows = await this.db
      .select()
      .from(proposals)
      .where(eq(proposals.id, id))
      .limit(1);

    return rows[0] ?? null;
  }

  async findActiveByBriefId(briefId: string): Promise<Proposal[]> {
    return this.db
      .select()
      .from(proposals)
      .where(and(eq(proposals.briefId, briefId), eq(proposals.status, "active")))
      .orderBy(desc(proposals.createdAt));
  }

  async findByBriefIdWithVenue(
    briefId: string,
  ): Promise<ProposalWithVenueRow[]> {
    return this.db
      .select({
        id: proposals.id,
        briefId: proposals.briefId,
        venueId: proposals.venueId,
        version: proposals.version,
        status: proposals.status,
        totalPrice: proposals.totalPrice,
        priceType: proposals.priceType,
        inclusions: proposals.inclusions,
        capacityConfirmed: proposals.capacityConfirmed,
        cateringType: proposals.cateringType,
        amenities: proposals.amenities,
        availabilityConfirmed: proposals.availabilityConfirmed,
        notes: proposals.notes,
        createdAt: proposals.createdAt,
        venueName: venues.name,
        venueCity: venues.city,
        venueEmail: venues.email,
        venuePhone: venues.phone,
      })
      .from(proposals)
      .innerJoin(venues, eq(proposals.venueId, venues.id))
      .where(eq(proposals.briefId, briefId))
      .orderBy(desc(proposals.createdAt));
  }

  async findByVenueId(venueId: string, cursor?: string): Promise<Proposal[]> {
    const whereClause = cursor
      ? and(eq(proposals.venueId, venueId), lt(proposals.id, cursor))
      : eq(proposals.venueId, venueId);

    return this.db
      .select()
      .from(proposals)
      .where(whereClause)
      .orderBy(desc(proposals.createdAt));
  }

  async findByVenueIdWithBrief(
    venueId: string,
    cursor?: string,
  ): Promise<ProposalWithBriefRow[]> {
    const whereClause = cursor
      ? and(eq(proposals.venueId, venueId), lt(proposals.id, cursor))
      : eq(proposals.venueId, venueId);

    return this.db
      .select({
        id: proposals.id,
        briefId: proposals.briefId,
        venueId: proposals.venueId,
        version: proposals.version,
        status: proposals.status,
        totalPrice: proposals.totalPrice,
        priceType: proposals.priceType,
        inclusions: proposals.inclusions,
        capacityConfirmed: proposals.capacityConfirmed,
        cateringType: proposals.cateringType,
        amenities: proposals.amenities,
        availabilityConfirmed: proposals.availabilityConfirmed,
        notes: proposals.notes,
        createdAt: proposals.createdAt,
        briefEventType: briefs.eventType,
        briefCity: briefs.city,
        briefDeadline: briefs.deadline,
        briefStatus: briefs.status,
      })
      .from(proposals)
      .innerJoin(briefs, eq(proposals.briefId, briefs.id))
      .where(whereClause)
      .orderBy(desc(proposals.createdAt));
  }

  /** All proposals a venue has submitted for a brief, newest version first
   *  (current active proposal plus its superseded earlier versions). */
  async findByVenueAndBrief(
    venueId: string,
    briefId: string,
  ): Promise<Proposal[]> {
    return this.db
      .select()
      .from(proposals)
      .where(and(eq(proposals.venueId, venueId), eq(proposals.briefId, briefId)))
      .orderBy(desc(proposals.version));
  }

  async findLatestByVenueAndBrief(
    venueId: string,
    briefId: string,
  ): Promise<Proposal | null> {
    const rows = await this.db
      .select()
      .from(proposals)
      .where(and(eq(proposals.venueId, venueId), eq(proposals.briefId, briefId)))
      .orderBy(desc(proposals.version))
      .limit(1);

    return rows[0] ?? null;
  }

  async create(input: CreateProposalInput): Promise<Proposal> {
    const rows = await this.db
      .insert(proposals)
      .values(input)
      .returning();

    return rows[0]!;
  }

  async supersedeAndCreate(
    venueId: string,
    briefId: string,
    input: Omit<CreateProposalInput, "venueId" | "briefId">,
  ): Promise<Proposal> {
    return this.db.transaction(async (tx) => {
      const previousRows = await tx
        .select()
        .from(proposals)
        .where(
          and(
            eq(proposals.venueId, venueId),
            eq(proposals.briefId, briefId),
            eq(proposals.status, "active"),
          ),
        )
        .orderBy(desc(proposals.version))
        .limit(1);
      const previous = previousRows[0];

      if (previous) {
        await tx
          .update(proposals)
          .set({ status: "superseded" })
          .where(eq(proposals.id, previous.id));
      }

      const insertedRows = await tx
        .insert(proposals)
        .values({
          ...input,
          briefId,
          venueId,
          version: previous ? previous.version + 1 : 1,
          status: "active",
        })
        .returning();

      return insertedRows[0]!;
    });
  }
}
