export function buildImproveBriefDescriptionPrompt(
  description: string,
  requirements: string[],
): string {
  return [
    "Improve this event brief description for venue operators.",
    "Keep the improved description accurate. Do not invent requirements, dates, budgets, or guarantees.",
    "Make it clear, specific, and useful for deciding whether to submit a proposal.",
    "",
    "Current description:",
    description || "(empty)",
    "",
    "Requirements:",
    JSON.stringify(requirements, null, 2),
  ].join("\n");
}
