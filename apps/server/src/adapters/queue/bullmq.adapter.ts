import { Queue } from "bullmq";
import { redis, withRedisTimeout } from "../../lib/redis";
import { logger } from "../../lib/logger";
import type { ConnectionOptions } from "bullmq";
import type {
  EnqueueOptions,
  JobPayload,
  QueueAdapter,
} from "./queue.adapter.interface";
import type { RedisConnection } from "../../lib/redis";

const DEFAULT_ATTEMPTS = 3;
const DEFAULT_BACKOFF_DELAY_MS = 2_000;

export class BullMQAdapter implements QueueAdapter {
  private queues = new Map<string, Queue>();

  constructor(private readonly connection: RedisConnection) {}

  // Get or create a BullMQ queue instance for the given name
  private getQueue(name: string): Queue {
    const existingQueue = this.queues.get(name);
    if (existingQueue) {
      return existingQueue;
    }

    const queue = new Queue(name, {
      connection: this.connection as ConnectionOptions,
    });
    this.queues.set(name, queue);

    return queue;
  }

  // Enqueue a job with the specified payload and options
  async enqueue(
    queueName: string,
    payload: JobPayload,
    options?: EnqueueOptions,
  ): Promise<void> {
    const queue = this.getQueue(queueName);

    try {
      await withRedisTimeout(
        () =>
          queue.add(payload.type, payload, {
            attempts: options?.attempts ?? DEFAULT_ATTEMPTS,
            delay: options?.delay,
            backoff: {
              type: "exponential",
              delay: DEFAULT_BACKOFF_DELAY_MS,
            },
          }),
        3_000,
      );
    } catch (err) {
      // Redis down / over quota: drop the job rather than failing the request.
      // The caller's primary action (e.g. creating a brief) still succeeds.
      logger.error(
        { err, queueName, jobType: payload.type },
        "Failed to enqueue job (Redis unavailable) — job dropped",
      );
    }
  }
}

export const queue = new BullMQAdapter(redis);
