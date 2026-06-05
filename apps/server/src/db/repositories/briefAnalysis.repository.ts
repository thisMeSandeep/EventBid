import { eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { BriefAnalysis } from "@eventbid/shared";
import { briefAnalyses } from "../schema";

export interface BriefAnalysisResults {
  summary: string;
  keyRequirements: string[];
  tips: string[];
}

export class BriefAnalysisRepository {
  constructor(private readonly db: PostgresJsDatabase) {}

  async findByBriefId(briefId: string): Promise<BriefAnalysis | null> {
    const rows = await this.db
      .select()
      .from(briefAnalyses)
      .where(eq(briefAnalyses.briefId, briefId))
      .limit(1);

    return rows[0] ?? null;
  }

  async upsertStatus(
    briefId: string,
    status: BriefAnalysis["status"],
  ): Promise<void> {
    await this.db
      .insert(briefAnalyses)
      .values({ briefId, status })
      .onConflictDoUpdate({
        target: briefAnalyses.briefId,
        set: { status, updatedAt: new Date() },
      });
  }

  async upsertResults(
    briefId: string,
    results: BriefAnalysisResults,
  ): Promise<void> {
    await this.db
      .insert(briefAnalyses)
      .values({
        briefId,
        status: "complete",
        summary: results.summary,
        keyRequirements: results.keyRequirements,
        tips: results.tips,
      })
      .onConflictDoUpdate({
        target: briefAnalyses.briefId,
        set: {
          status: "complete",
          summary: results.summary,
          keyRequirements: results.keyRequirements,
          tips: results.tips,
          updatedAt: new Date(),
        },
      });
  }
}
