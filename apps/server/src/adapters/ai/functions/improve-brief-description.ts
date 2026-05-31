import { streamText } from "ai";
import { buildImproveBriefDescriptionPrompt } from "../prompts/improve-brief-description.prompt";

export async function* improveBriefDescriptionWithAI(
  model: string,
  description: string,
  requirements: string[],
): AsyncGenerator<string> {
  const { textStream } = streamText({
    model,
    prompt: buildImproveBriefDescriptionPrompt(description, requirements),
  });

  for await (const chunk of textStream) {
    yield chunk;
  }
}
