import { Queue, Worker } from "bullmq";
import type { ConnectionOptions } from "bullmq";
import type { Adapters } from "../adapters";
import type { JobPayload } from "../adapters/queue/queue.adapter.interface";
import type { Repositories } from "../db/repositories";
import type { RedisConnection } from "../lib/redis";
import { logger } from "../lib/logger";
import type { Services } from "../services";

export interface JobDependencies {
  services: Services;
  repositories: Repositories;
  adapters: Adapters;
}

export interface JobConfig {
  queueName: string;
  concurrency: number;
  handler: (payload: JobPayload, deps: JobDependencies) => Promise<void>;
  retries: number;
  cron?: string;
}

export type JobRegistry = JobConfig[];

export class JobEngine {
  private workers: Worker[] = [];
  private cronQueues: Queue[] = [];

  constructor(
    private readonly registry: JobRegistry,
    private readonly connection: RedisConnection,
    private readonly deps: JobDependencies,
  ) {}

  start(): void {
    for (const config of this.registry) {
      const worker = new Worker(
        config.queueName,
        async (job) => {
          await config.handler(job.data as JobPayload, this.deps);
        },
        {
          connection: this.connection as ConnectionOptions,
          concurrency: config.concurrency,
          drainDelay: 60, // seconds between idle fetch re-polls (default 5)
          stalledInterval: 300_000, // ms between stalled-job checks (default 30_000)
        },
      );

      worker.on("failed", (job, error) => {
        logger.error(
          { err: error, queueName: config.queueName, jobId: job?.id },
          "Job failed",
        );
      });

      worker.on("ready", () => {
        logger.info({ queueName: config.queueName }, "Job worker ready");
      });

      // Internal worker errors (e.g. Redis down / Upstash quota exceeded during
      // the periodic stalled-job check). Log a one-line message instead of the
      // full Redis command dump, and let BullMQ keep failing silently — this
      // must not crash or block the rest of the server.
      worker.on("error", (error) => {
        logger.warn(
          { queueName: config.queueName, err: (error as Error).message },
          "Job worker error (Redis/BullMQ) — ignoring",
        );
      });

      if (config.cron) {
        const queue = new Queue(config.queueName, {
          connection: this.connection as ConnectionOptions,
        });

        void queue.add(
          "cron",
          {},
          {
            repeat: { pattern: config.cron },
            attempts: config.retries,
            backoff: {
              type: "exponential",
              delay: 2_000,
            },
          },
        );

        this.cronQueues.push(queue);
        logger.info(
          { queueName: config.queueName, cron: config.cron },
          "Cron job scheduled",
        );
      }

      this.workers.push(worker);
    }
  }

  async stop(): Promise<void> {
    await Promise.all([
      ...this.workers.map((worker) => worker.close()),
      ...this.cronQueues.map((queue) => queue.close()),
    ]);
  }
}
