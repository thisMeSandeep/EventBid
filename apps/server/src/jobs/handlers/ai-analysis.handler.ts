import type { JobDependencies } from "../engine";
import type { JobPayload } from "../../adapters/queue/queue.adapter.interface";

export async function aiAnalysisHandler(
  payload: JobPayload,
  { services }: JobDependencies,
): Promise<void> {
  await services.analysis.runAnalysis(payload.briefId as string);
}
