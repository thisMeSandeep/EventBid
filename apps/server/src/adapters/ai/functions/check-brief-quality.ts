import { generateText, Output } from "ai";
import { z } from "zod";
import type { CreateBriefDto } from "@eventbid/shared";
import { buildCheckBriefQualityPrompt } from "../prompts/check-brief-quality.prompt";
import type { BriefQualityResult } from "../ai.provider.interface";

const briefQualitySchema = z.object({
  warnings: z.array(z.string()),
});

export async function checkBriefQualityWithAI(
  model: string,
  brief: CreateBriefDto,
): Promise<BriefQualityResult> {
  const { output } = await generateText({
    model,
    output: Output.object({
      schema: briefQualitySchema,
    }),
    prompt: buildCheckBriefQualityPrompt(brief),
  });

  return output;
}
