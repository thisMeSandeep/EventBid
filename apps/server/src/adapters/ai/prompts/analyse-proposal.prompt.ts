import type { Brief, Proposal } from "@eventbid/shared";

export function buildAnalyseProposalPrompt(
  brief: Brief,
  proposal: Proposal,
): string {
  return [
    "Analyse a single venue proposal against an event brief for the host.",
    "Return an overall match score from 0 to 100, plus three sub-scores from 0 to 100:",
    "- budgetFit: how well the proposal's price fits the brief's budget range.",
    "- inclusionsMatch: how well the inclusions and amenities cover the brief's requirements.",
    "- briefAlignment: overall fit on capacity, availability, event type, and intent.",
    "Write a concise, factual plain-text summary (1-3 sentences) explaining the score.",
    "List concrete gaps: short plain-text phrases naming shortfalls against the brief. Empty if none.",
    "Do not invent facts. Do not use markdown, headings, or commentary.",
    "",
    "Brief:",
    JSON.stringify(brief, null, 2),
    "",
    "Proposal:",
    JSON.stringify(proposal, null, 2),
  ].join("\n");
}
