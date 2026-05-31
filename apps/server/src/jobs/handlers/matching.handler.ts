import type { JobDependencies } from "../engine";
import type { JobPayload } from "../../adapters/queue/queue.adapter.interface";

export async function matchingHandler(
  payload: JobPayload,
  { services }: JobDependencies,
): Promise<void> {
  await services.matching.matchBriefToVenues(payload.briefId as string);
}
