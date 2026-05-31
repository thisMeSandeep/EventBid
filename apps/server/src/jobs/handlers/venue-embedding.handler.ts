import type { JobDependencies } from "../engine";
import type { JobPayload } from "../../adapters/queue/queue.adapter.interface";

export async function venueEmbeddingHandler(
  payload: JobPayload,
  { services }: JobDependencies,
): Promise<void> {
  await services.venueEmbedding.generateAndStore(payload.venueId as string);
}
