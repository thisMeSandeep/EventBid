import type { JobDependencies } from "../engine";
import type { JobPayload } from "../../adapters/queue/queue.adapter.interface";

export async function proposalAnalysisHandler(
  payload: JobPayload,
  { services }: JobDependencies,
): Promise<void> {
  await services.proposalAnalysis.generate(payload.proposalId as string);
}
