import { and, desc, eq, inArray, lt, sql } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type {
  Brief,
  BriefVenueMatch,
  CreateBriefVenueMatchInput,
} from "@eventbid/shared";
import { briefVenueMatches, briefs } from "../schema";

export type BriefVenueMatchWithBrief = BriefVenueMatch & { brief: Brief };

export class BriefVenueMatchRepository {
  constructor(private readonly db: PostgresJsDatabase) {}

  /** Upsert matches: insert new (brief, venue) pairs and refresh the score on
   *  existing ones so re-matching after an edit keeps scores current. */
  async createBatch(matches: CreateBriefVenueMatchInput[]): Promise<void> {
    if (matches.length === 0) {
      return;
    }

    await this.db
      .insert(briefVenueMatches)
      .values(matches)
      .onConflictDoUpdate({
        target: [briefVenueMatches.briefId, briefVenueMatches.venueId],
        set: { matchScore: sql`excluded.match_score` },
      });
  }

  /** Of the given venueIds, which are already matched to this brief. */
  async findMatchedVenueIds(
    briefId: string,
    venueIds: string[],
  ): Promise<Set<string>> {
    if (venueIds.length === 0) {
      return new Set();
    }

    const rows = await this.db
      .select({ venueId: briefVenueMatches.venueId })
      .from(briefVenueMatches)
      .where(
        and(
          eq(briefVenueMatches.briefId, briefId),
          inArray(briefVenueMatches.venueId, venueIds),
        ),
      );

    return new Set(rows.map((row) => row.venueId));
  }

  /** Of the given briefIds, which are already matched to this venue. */
  async findMatchedBriefIds(
    venueId: string,
    briefIds: string[],
  ): Promise<Set<string>> {
    if (briefIds.length === 0) {
      return new Set();
    }

    const rows = await this.db
      .select({ briefId: briefVenueMatches.briefId })
      .from(briefVenueMatches)
      .where(
        and(
          eq(briefVenueMatches.venueId, venueId),
          inArray(briefVenueMatches.briefId, briefIds),
        ),
      );

    return new Set(rows.map((row) => row.briefId));
  }

  async findByVenueId(
    venueId: string,
    cursor?: string,
  ): Promise<BriefVenueMatchWithBrief[]> {
    // The feed only surfaces briefs still accepting proposals — closed/expired
    // briefs drop out automatically.
    const whereClause = cursor
      ? and(
          eq(briefVenueMatches.venueId, venueId),
          eq(briefs.status, "open"),
          lt(briefVenueMatches.id, cursor),
        )
      : and(eq(briefVenueMatches.venueId, venueId), eq(briefs.status, "open"));

    const rows = await this.db
      .select({
        match: briefVenueMatches,
        brief: briefs,
      })
      .from(briefVenueMatches)
      .innerJoin(briefs, eq(briefVenueMatches.briefId, briefs.id))
      .where(whereClause)
      .orderBy(desc(briefVenueMatches.createdAt));

    return rows.map((row) => ({
      ...row.match,
      brief: row.brief,
    }));
  }

  async findByBriefAndVenue(
    briefId: string,
    venueId: string,
  ): Promise<BriefVenueMatch | null> {
    const rows = await this.db
      .select()
      .from(briefVenueMatches)
      .where(
        and(
          eq(briefVenueMatches.briefId, briefId),
          eq(briefVenueMatches.venueId, venueId),
        ),
      )
      .limit(1);

    return rows[0] ?? null;
  }

  async findByBriefId(briefId: string): Promise<BriefVenueMatch[]> {
    return this.db
      .select()
      .from(briefVenueMatches)
      .where(eq(briefVenueMatches.briefId, briefId))
      .orderBy(desc(briefVenueMatches.matchScore));
  }
}
