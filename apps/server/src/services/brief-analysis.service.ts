import type { AIProvider } from "../adapters";
import type { Repositories } from "../db/repositories";

/** Generates and stores the per-brief "how to win" AI guide shown to venues.
 *  Runs in the background after a brief is created or its details change. */
export class BriefAnalysisService {
  constructor(
    private readonly repos: Repositories,
    private readonly ai: AIProvider,
  ) {}

  async generate(briefId: string): Promise<void> {
    const brief = await this.repos.briefs.findById(briefId);
    if (!brief) {
      return;
    }

    try {
      const result = await this.ai.briefWinGuide(brief);
      await this.repos.briefAnalyses.upsertResults(briefId, result);
    } catch (err) {
      await this.repos.briefAnalyses.upsertStatus(briefId, "failed");
      throw err; // let the job retry
    }
  }
}
