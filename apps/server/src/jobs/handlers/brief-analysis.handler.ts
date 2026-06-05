import type { JobDependencies } from "../engine";
import type { JobPayload } from "../../adapters/queue/queue.adapter.interface";

export async function briefAnalysisHandler(
  payload: JobPayload,
  { services }: JobDependencies,
): Promise<void> {
  await services.briefAnalysis.generate(payload.briefId as string);
}
