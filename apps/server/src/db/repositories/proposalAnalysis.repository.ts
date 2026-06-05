import { eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { ProposalAnalysis, ProposalSubScores } from "@eventbid/shared";
import { proposalAnalyses } from "../schema";

export interface ProposalAnalysisResults {
  score: number;
  subScores: ProposalSubScores;
  summary: string;
  gaps: string[];
}

export class ProposalAnalysisRepository {
  constructor(private readonly db: PostgresJsDatabase) {}

  async findByProposalId(proposalId: string): Promise<ProposalAnalysis | null> {
    const rows = await this.db
      .select()
      .from(proposalAnalyses)
      .where(eq(proposalAnalyses.proposalId, proposalId))
      .limit(1);

    return rows[0] ?? null;
  }

  async upsertStatus(
    proposalId: string,
    briefId: string,
    status: ProposalAnalysis["status"],
  ): Promise<void> {
    await this.db
      .insert(proposalAnalyses)
      .values({ proposalId, briefId, status })
      .onConflictDoUpdate({
        target: proposalAnalyses.proposalId,
        set: { status, updatedAt: new Date() },
      });
  }

  async upsertResults(
    proposalId: string,
    briefId: string,
    results: ProposalAnalysisResults,
  ): Promise<void> {
    await this.db
      .insert(proposalAnalyses)
      .values({
        proposalId,
        briefId,
        status: "complete",
        score: results.score,
        subScores: results.subScores,
        summary: results.summary,
        gaps: results.gaps,
      })
      .onConflictDoUpdate({
        target: proposalAnalyses.proposalId,
        set: {
          status: "complete",
          score: results.score,
          subScores: results.subScores,
          summary: results.summary,
          gaps: results.gaps,
          updatedAt: new Date(),
        },
      });
  }
}
