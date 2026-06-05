import { generateText, Output } from "ai";
import { z } from "zod";
import type { Brief, Proposal } from "@eventbid/shared";
import { buildAnalyseProposalPrompt } from "../prompts/analyse-proposal.prompt";
import type { ProposalAnalysisResult } from "../ai.provider.interface";

const score = z.number().min(0).max(100);

const proposalAnalysisSchema = z.object({
  score,
  subScores: z.object({
    budgetFit: score,
    inclusionsMatch: score,
    briefAlignment: score,
  }),
  summary: z.string(),
  gaps: z.array(z.string()),
});

export async function analyseProposalWithAI(
  model: string,
  brief: Brief,
  proposal: Proposal,
): Promise<ProposalAnalysisResult> {
  const { output } = await generateText({
    model,
    output: Output.object({ schema: proposalAnalysisSchema }),
    prompt: buildAnalyseProposalPrompt(brief, proposal),
  });

  return output;
}
