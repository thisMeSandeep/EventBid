import { and, desc, eq, lt } from "drizzle-orm";
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

  async createBatch(matches: CreateBriefVenueMatchInput[]): Promise<void> {
    if (matches.length === 0) {
      return;
    }

    await this.db
      .insert(briefVenueMatches)
      .values(matches)
      .onConflictDoNothing();
  }

  async findByVenueId(
    venueId: string,
    cursor?: string,
  ): Promise<BriefVenueMatchWithBrief[]> {
    const whereClause = cursor
      ? and(eq(briefVenueMatches.venueId, venueId), lt(briefVenueMatches.id, cursor))
      : eq(briefVenueMatches.venueId, venueId);

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
