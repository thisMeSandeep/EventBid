import type { JobDependencies } from "../engine";
import type { JobPayload } from "../../adapters/queue/queue.adapter.interface";

export async function venueEmbeddingHandler(
  payload: JobPayload,
  { services }: JobDependencies,
): Promise<void> {
  const venueId = payload.venueId as string;
  // Embed first, then reverse-match against active briefs so the venue picks up
  // older still-open briefs (on signup or after a matchable profile edit).
  await services.venueEmbedding.generateAndStore(venueId);
  await services.matching.matchVenueToBriefs(venueId);
}
