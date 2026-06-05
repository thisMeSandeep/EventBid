import type { Brief, Proposal } from "@eventbid/shared";

export function buildAnalyseProposalsPrompt(
  brief: Brief,
  proposals: Proposal[],
): string {
  return [
    "Analyse venue proposals for an event brief.",
    "Score each proposal from 0 to 100 based on fit, price, capacity, availability, inclusions, and requirement coverage.",
    "Return exactly one result per proposal, using the proposal's own id as proposalId.",
    "",
    "For each result:",
    "- summary: a concise, factual plain-text explanation of the score in one or two sentences.",
    "- gaps: each entry is one short plain-text phrase naming a specific shortfall against the brief.",
    "- Do not use markdown, greetings, headings, numbering, or commentary in any text field.",
    "",
    "Brief:",
    JSON.stringify(brief, null, 2),
    "",
    "Proposals:",
    JSON.stringify(proposals, null, 2),
  ].join("\n");
}
