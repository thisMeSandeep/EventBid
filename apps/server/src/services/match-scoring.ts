import type { Brief, Venue } from "@eventbid/shared";

/**
 * The concrete brief ⇄ venue matching model.
 *
 * Matching is a two-stage decision:
 *   1. Hard gate (handled by the repositories): same city, the venue serves the
 *      brief's event type, and the venue can physically hold the headcount.
 *      A candidate that fails any of these is never a match.
 *   2. Composite score (this module): a weighted blend of the signals we can
 *      measure for candidates that clear the gate. Only candidates scoring at or
 *      above MATCH_THRESHOLD are recorded as matches and notified; matchScore is
 *      this composite, so the venue feed ranks by genuine fit.
 *
 * Tune the weights and threshold here against real data — this is the single
 * source of truth for both forward (brief→venues) and reverse (venue→briefs)
 * matching.
 */
export const MATCH_WEIGHTS = {
  /** Semantic fit between the brief and venue descriptions (embedding cosine). */
  semantic: 0.55,
  /** Share of the brief's required amenities the venue actually offers. */
  requirements: 0.3,
  /** How well the venue's capacity is sized to the headcount. */
  capacity: 0.15,
} as const;

/** Composite scores below this are not considered a match worth surfacing. */
export const MATCH_THRESHOLD = 0.45;

export interface MatchSignals {
  semantic: number;
  requirements: number;
  capacity: number;
}

export interface MatchResult {
  score: number;
  signals: MatchSignals;
}

/** Score a single brief/venue pair that has already cleared the hard gate.
 *  `semanticSimilarity` is the cosine similarity of their embeddings. */
export function scoreMatch(
  brief: Brief,
  venue: Venue,
  semanticSimilarity: number,
): MatchResult {
  const signals: MatchSignals = {
    semantic: clamp01(semanticSimilarity),
    requirements: requirementCoverage(brief, venue),
    capacity: capacityFit(brief, venue),
  };

  const score =
    MATCH_WEIGHTS.semantic * signals.semantic +
    MATCH_WEIGHTS.requirements * signals.requirements +
    MATCH_WEIGHTS.capacity * signals.capacity;

  return { score, signals };
}

/** Whether a composite score clears the bar to be recorded/notified. */
export function isMatch(score: number): boolean {
  return score >= MATCH_THRESHOLD;
}

/** Fraction of the brief's required amenities the venue offers. A brief with no
 *  stated requirements is trivially fully covered. */
function requirementCoverage(brief: Brief, venue: Venue): number {
  const required = brief.requirements ?? [];
  if (required.length === 0) {
    return 1;
  }

  const offered = new Set((venue.amenities ?? []).map(normalize));
  const covered = required.filter((req) => offered.has(normalize(req))).length;
  return covered / required.length;
}

/** The hard gate guarantees the venue is big enough; this rewards venues sized
 *  close to the headcount over vastly oversized ones (which still pass, but are
 *  a weaker fit). Ranges from 0.5 (hugely oversized) to 1.0 (right-sized). */
function capacityFit(brief: Brief, venue: Venue): number {
  if (venue.maxCapacity <= 0) {
    return 0;
  }

  const utilization = Math.min(brief.headcount / venue.maxCapacity, 1);
  return 0.5 + 0.5 * utilization;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    const ai = a[i] ?? 0;
    const bi = b[i] ?? 0;
    dot += ai * bi;
    magA += ai * ai;
    magB += bi * bi;
  }

  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

export function buildBriefEmbeddingDocument(brief: Brief): string {
  return [
    `Event type: ${brief.eventType}`,
    `Description: ${brief.description ?? ""}`,
    `Requirements: ${formatList(brief.requirements)}`,
    `Location: ${brief.city}, ${brief.state}`,
    `Headcount: ${brief.headcount}`,
    `Budget: ${brief.budgetMin} to ${brief.budgetMax}`,
    `Event date range: ${brief.eventDateFrom} to ${brief.eventDateTo}`,
    `Time of day: ${brief.timeOfDay ?? "not specified"}`,
  ].join("\n");
}

function formatList(values: string[] | null): string {
  if (!values || values.length === 0) {
    return "none specified";
  }

  return values.join(", ");
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}
