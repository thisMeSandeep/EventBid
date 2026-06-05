import type { Brief } from "@eventbid/shared";

export function buildBriefWinGuidePrompt(brief: Brief): string {
  return [
    "You are advising a venue on how to win an event brief.",
    "Read the brief and produce guidance for a venue deciding how to propose.",
    "Return:",
    "- summary: a concise plain-text overview of what the host wants (1-3 sentences).",
    "- keyRequirements: the most important requirements a proposal must address (short phrases).",
    "- tips: concrete, actionable suggestions that make a proposal more competitive (short phrases).",
    "Base everything on the brief only. Do not invent facts, dates, or budgets.",
    "Do not use markdown, headings, greetings, or commentary.",
    "",
    "Brief:",
    JSON.stringify(brief, null, 2),
  ].join("\n");
}
