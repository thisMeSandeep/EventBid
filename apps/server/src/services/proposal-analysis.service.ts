import type { AIProvider } from "../adapters";
import type { Repositories } from "../db/repositories";

/** Generates and stores the per-proposal AI analysis. Runs once in the
 *  background after a proposal is created (proposals are immutable — a revision
 *  is a new proposal, which gets its own analysis). */
export class ProposalAnalysisService {
  constructor(
    private readonly repos: Repositories,
    private readonly ai: AIProvider,
  ) {}

  async generate(proposalId: string): Promise<void> {
    const proposal = await this.repos.proposals.findById(proposalId);
    if (!proposal) {
      return;
    }

    const brief = await this.repos.briefs.findById(proposal.briefId);
    if (!brief) {
      return;
    }

    try {
      const result = await this.ai.analyseProposal(brief, proposal);
      await this.repos.proposalAnalyses.upsertResults(
        proposalId,
        brief.id,
        result,
      );
    } catch (err) {
      await this.repos.proposalAnalyses.upsertStatus(
        proposalId,
        brief.id,
        "failed",
      );
      throw err; // let the job retry
    }
  }
}
