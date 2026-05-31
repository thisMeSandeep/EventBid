import { generateText, Output } from "ai";
import { z } from "zod";
import { buildImproveBriefDescriptionPrompt } from "../prompts/improve-brief-description.prompt";
import type { BriefDescriptionImprovement } from "../ai.provider.interface";

const improvedDescriptionSchema = z.object({
  description: z.string(),
});

export async function improveBriefDescriptionWithAI(
  model: string,
  description: string,
  requirements: string[],
): Promise<BriefDescriptionImprovement> {
  const { output } = await generateText({
    model,
    output: Output.object({
      schema: improvedDescriptionSchema,
    }),
    prompt: buildImproveBriefDescriptionPrompt(description, requirements),
  });

  return output;
}
