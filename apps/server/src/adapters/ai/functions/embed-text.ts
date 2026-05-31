import { embed } from "ai";

export async function embedTextWithAI(
  model: string,
  text: string,
): Promise<number[]> {
  const { embedding } = await embed({
    model,
    value: text,
  });

  return embedding;
}
