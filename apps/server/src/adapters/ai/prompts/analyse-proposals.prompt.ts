import type { Brief, Proposal } from "@eventbid/shared";

export function buildAnalyseProposalsPrompt(
  brief: Brief,
  proposals: Proposal[],
): string {
  return [
    "Analyse venue proposals for an event brief.",
    "Score each proposal from 0 to 100 based on fit, price, capacity, availability, inclusions, and requirement coverage.",
    "Return one result per proposal. Be concise and factual.",
    "",
    "Brief:",
    JSON.stringify(brief, null, 2),
    "",
    "Proposals:",
    JSON.stringify(proposals, null, 2),
  ].join("\n");
}
