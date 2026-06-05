import type { CreateBriefDto } from "@eventbid/shared";

export function buildCheckBriefQualityPrompt(brief: CreateBriefDto): string {
  return [
    "Review this event brief before it is submitted to venues.",
    "Return warnings for missing, vague, contradictory, or unusually broad requirements.",
    "Only include actionable warnings. Return an empty warnings array if the brief is good enough.",
    "",
    "Each warning must be:",
    "- A single concise plain-text sentence stating one specific issue.",
    "- Free of markdown, greetings, headings, numbering, or commentary.",
    "- Phrased as the concrete problem and what to fix, not a conversation.",
    "",
    "Brief:",
    JSON.stringify(brief, null, 2),
  ].join("\n");
}
