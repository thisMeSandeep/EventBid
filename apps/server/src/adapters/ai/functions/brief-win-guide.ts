import { generateText, Output } from "ai";
import { z } from "zod";
import type { Brief } from "@eventbid/shared";
import { buildBriefWinGuidePrompt } from "../prompts/brief-win-guide.prompt";
import type { BriefWinGuideResult } from "../ai.provider.interface";

const briefWinGuideSchema = z.object({
  summary: z.string(),
  keyRequirements: z.array(z.string()),
  tips: z.array(z.string()),
});

export async function briefWinGuideWithAI(
  model: string,
  brief: Brief,
): Promise<BriefWinGuideResult> {
  const { output } = await generateText({
    model,
    output: Output.object({ schema: briefWinGuideSchema }),
    prompt: buildBriefWinGuidePrompt(brief),
  });

  return output;
}
