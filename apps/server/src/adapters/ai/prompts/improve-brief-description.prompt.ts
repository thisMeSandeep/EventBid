export function buildImproveBriefDescriptionPrompt(
  description: string,
  requirements: string[],
): string {
  return [
    "You are a text rewriting engine, not a chatbot. Rewrite the event brief description below to be clearer, more specific, and more useful for venue operators deciding whether to submit a proposal.",
    "",
    "Rules:",
    "- Output ONLY the improved description text. Nothing else.",
    "- Do NOT add greetings, headings, titles, labels, preambles, or closing remarks.",
    "- Do NOT add commentary, explanations, or notes about what you changed.",
    "- Do NOT use markdown formatting (no #, *, -, backticks, bold, or bullet lists).",
    "- Return plain prose text only.",
    "- Keep it accurate. Do not invent requirements, dates, budgets, or guarantees.",
    "- Use the requirements only as context; do not list or restate them verbatim.",
    "",
    "Current description:",
    description || "(empty)",
    "",
    "Requirements (context only):",
    JSON.stringify(requirements, null, 2),
  ].join("\n");
}
