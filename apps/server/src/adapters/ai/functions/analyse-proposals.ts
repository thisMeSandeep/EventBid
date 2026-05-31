import { generateText, Output } from "ai";
import { z } from "zod";
import type { Brief, Proposal } from "@eventbid/shared";
import { buildAnalyseProposalsPrompt } from "../prompts/analyse-proposals.prompt";
import type { AnalysisResult } from "../ai.provider.interface";

const analysisResultSchema = z.object({
  results: z.array(
    z.object({
      proposalId: z.string(),
      score: z.number().min(0).max(100),
      summary: z.string(),
      gaps: z.array(z.string()),
    }),
  ),
});

export async function analyseProposalsWithAI(
  model: string,
  brief: Brief,
  proposals: Proposal[],
): Promise<AnalysisResult[]> {
  if (proposals.length === 0) {
    return [];
  }

  const { output } = await generateText({
    model,
    output: Output.object({
      schema: analysisResultSchema,
    }),
    prompt: buildAnalyseProposalsPrompt(brief, proposals),
  });

  return output.results;
}
