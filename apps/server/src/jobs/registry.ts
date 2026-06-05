import type { JobDependencies, JobRegistry } from "./engine";
import { aiAnalysisHandler } from "./handlers/ai-analysis.handler";
import { briefAnalysisHandler } from "./handlers/brief-analysis.handler";
import { deadlineHandler } from "./handlers/deadline.handler";
import { emailHandler } from "./handlers/email.handler";
import { matchingHandler } from "./handlers/matching.handler";
import { proposalAnalysisHandler } from "./handlers/proposal-analysis.handler";
import { venueEmbeddingHandler } from "./handlers/venue-embedding.handler";

export const jobRegistry: JobRegistry = [
  {
    queueName: "matching",
    concurrency: 5,
    handler: matchingHandler,
    retries: 3,
  },
  {
    queueName: "ai-analysis",
    concurrency: 2,
    handler: aiAnalysisHandler,
    retries: 2,
  },
  {
    queueName: "proposal-analysis",
    concurrency: 2,
    handler: proposalAnalysisHandler,
    retries: 3,
  },
  {
    queueName: "brief-analysis",
    concurrency: 2,
    handler: briefAnalysisHandler,
    retries: 3,
  },
  {
    queueName: "email",
    concurrency: 10,
    handler: emailHandler,
    retries: 3,
  },
  {
    queueName: "deadline",
    concurrency: 1,
    handler: deadlineHandler,
    retries: 1,
    cron: "*/5 * * * *",
  },
  {
    queueName: "venue-embedding",
    concurrency: 3,
    handler: venueEmbeddingHandler,
    retries: 3,
  },
];

export type { JobDependencies };
