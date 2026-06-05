import { and, desc, eq, gt, inArray, lt, lte, sql } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type {
  Brief,
  CreateBriefInput,
  UpdateBriefInput,
} from "@eventbid/shared";
import { briefs, proposals } from "../schema";

export class BriefRepository {
  constructor(private readonly db: PostgresJsDatabase) {}

  async findById(id: string): Promise<Brief | null> {
    const rows = await this.db
      .select()
      .from(briefs)
      .where(eq(briefs.id, id))
      .limit(1);

    return rows[0] ?? null;
  }

  async findByHostId(hostId: string, cursor?: string): Promise<Brief[]> {
    const whereClause = cursor
      ? and(eq(briefs.hostId, hostId), lt(briefs.id, cursor))
      : eq(briefs.hostId, hostId);

    return this.db
      .select()
      .from(briefs)
      .where(whereClause)
      .orderBy(desc(briefs.createdAt));
  }

  /** Active briefs (open, deadline in the future) that hard-match a venue:
   *  same city, headcount within the venue's capacity, and an event type the
   *  venue serves. Used for reverse matching when a venue joins/updates. */
  async findActiveForVenue(params: {
    city: string;
    maxCapacity: number;
    eventTypes: string[];
  }): Promise<Brief[]> {
    const { city, maxCapacity, eventTypes } = params;
    if (eventTypes.length === 0) {
      return [];
    }

    return this.db
      .select()
      .from(briefs)
      .where(
        and(
          eq(briefs.status, "open"),
          gt(briefs.deadline, sql`now()`),
          eq(briefs.city, city),
          lte(briefs.headcount, maxCapacity),
          inArray(briefs.eventType, eventTypes),
        ),
      );
  }

  async findOpenPastDeadline(): Promise<Brief[]> {
    return this.db
      .select()
      .from(briefs)
      .where(
        and(eq(briefs.status, "open"), lt(briefs.deadline, sql`now()`)),
      );
  }

  async create(input: CreateBriefInput & { hostId: string }): Promise<Brief> {
    const rows = await this.db
      .insert(briefs)
      .values(input)
      .returning();

    return rows[0]!;
  }

  async update(id: string, input: UpdateBriefInput): Promise<Brief> {
    const rows = await this.db
      .update(briefs)
      .set(input)
      .where(eq(briefs.id, id))
      .returning();

    return rows[0]!;
  }

  async updateStatus(id: string, status: Brief["status"]): Promise<void> {
    await this.db
      .update(briefs)
      .set({ status })
      .where(eq(briefs.id, id));
  }

  /** Close a brief without a winner: mark the brief closed and decline any
   *  still-active proposals, in one transaction. */
  async close(id: string): Promise<Brief> {
    return this.db.transaction(async (tx) => {
      await tx
        .update(proposals)
        .set({ status: "closed" })
        .where(and(eq(proposals.briefId, id), eq(proposals.status, "active")));

      const rows = await tx
        .update(briefs)
        .set({ status: "closed", updatedAt: new Date() })
        .where(eq(briefs.id, id))
        .returning();

      return rows[0]!;
    });
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(briefs).where(eq(briefs.id, id));
  }
}
