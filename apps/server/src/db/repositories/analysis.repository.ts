import { eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { AiAnalysis } from "@eventbid/shared";
import { aiAnalyses } from "../schema";

export type AiAnalysisResults = Record<string, unknown>;

export class AnalysisRepository {
  constructor(private readonly db: PostgresJsDatabase) {}

  async findByBriefId(briefId: string): Promise<AiAnalysis | null> {
    const rows = await this.db
      .select()
      .from(aiAnalyses)
      .where(eq(aiAnalyses.briefId, briefId))
      .limit(1);

    return rows[0] ?? null;
  }

  async upsertStatus(
    briefId: string,
    status: AiAnalysis["status"],
  ): Promise<void> {
    await this.db
      .insert(aiAnalyses)
      .values({ briefId, status })
      .onConflictDoUpdate({
        target: aiAnalyses.briefId,
        set: { status, updatedAt: new Date() },
      });
  }

  async upsertResults(
    briefId: string,
    input: {
      status: AiAnalysis["status"];
      versionKey: string;
      results: AiAnalysisResults;
    },
  ): Promise<void> {
    await this.db
      .insert(aiAnalyses)
      .values({
        briefId,
        status: input.status,
        versionKey: input.versionKey,
        results: input.results,
      })
      .onConflictDoUpdate({
        target: aiAnalyses.briefId,
        set: {
          status: input.status,
          versionKey: input.versionKey,
          results: input.results,
          updatedAt: new Date(),
        },
      });
  }
}
