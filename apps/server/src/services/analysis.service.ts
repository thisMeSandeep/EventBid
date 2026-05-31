import type { AIProvider, AnalysisResult, NotifierAdapter } from "../adapters";
import type { Repositories } from "../db/repositories";
import type { Proposal } from "@eventbid/shared";

type StoredAnalysisResult = Omit<AnalysisResult, "proposalId">;

export class AnalysisService {
  constructor(
    private readonly repos: Repositories,
    private readonly ai: AIProvider,
    private readonly notifier: NotifierAdapter,
  ) {}

  async runAnalysis(briefId: string): Promise<void> {
    const [brief, activeProposals] = await Promise.all([
      this.repos.briefs.findById(briefId),
      this.repos.proposals.findActiveByBriefId(briefId),
    ]);

    if (!brief || activeProposals.length < 2) {
      return;
    }

    const versionKey = this.computeVersionKey(activeProposals);
    const existing = await this.repos.analyses.findByBriefId(briefId);

    if (existing?.versionKey === versionKey) {
      await this.notifier.emit(brief.hostId, "analysis.ready", { briefId });
      return;
    }

    await this.repos.analyses.upsertStatus(briefId, "running");

    const previousKeys = new Set((existing?.versionKey ?? "").split("|"));
    const changedProposals = activeProposals.filter(
      (proposal) =>
        !previousKeys.has(getProposalVersionSegment(proposal)),
    );
    const unchangedIds = activeProposals
      .filter((proposal) =>
        previousKeys.has(getProposalVersionSegment(proposal)),
      )
      .map((proposal) => proposal.id);

    const storedResults = readStoredResults(existing?.results);
    const cachedResults: AnalysisResult[] = unchangedIds
      .map((proposalId) => {
        const cached = storedResults[proposalId];
        if (!cached) {
          return null;
        }

        return { proposalId, ...cached };
      })
      .filter((result): result is AnalysisResult => result !== null);

    const freshResults =
      changedProposals.length > 0
        ? await this.ai.analyseProposals(brief, changedProposals)
        : [];

    const mergedResults = [...cachedResults, ...freshResults];

    await this.repos.analyses.upsertResults(briefId, {
      status: "complete",
      versionKey,
      results: toStoredResults(mergedResults),
    });

    await this.notifier.emit(brief.hostId, "analysis.ready", { briefId });
  }

  private computeVersionKey(proposals: Proposal[]): string {
    return proposals
      .map((proposal) => getProposalVersionSegment(proposal))
      .sort()
      .join("|");
  }
}

function getProposalVersionSegment(proposal: Proposal): string {
  return `${proposal.id}:${proposal.createdAt?.getTime() ?? 0}`;
}

function readStoredResults(
  results: unknown,
): Record<string, StoredAnalysisResult> {
  if (!results || typeof results !== "object" || Array.isArray(results)) {
    return {};
  }

  const stored: Record<string, StoredAnalysisResult> = {};

  for (const [proposalId, value] of Object.entries(results)) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      continue;
    }

    const record = value as Record<string, unknown>;
    if (
      typeof record.score !== "number" ||
      typeof record.summary !== "string" ||
      !Array.isArray(record.gaps) ||
      !record.gaps.every((gap) => typeof gap === "string")
    ) {
      continue;
    }

    stored[proposalId] = {
      score: record.score,
      summary: record.summary,
      gaps: record.gaps,
    };
  }

  return stored;
}

function toStoredResults(
  results: AnalysisResult[],
): Record<string, StoredAnalysisResult> {
  return Object.fromEntries(
    results.map(({ proposalId, score, summary, gaps }) => [
      proposalId,
      { score, summary, gaps },
    ]),
  );
}
