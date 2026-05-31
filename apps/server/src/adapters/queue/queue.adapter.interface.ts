export interface JobPayload {
  type: string;
  [key: string]: unknown;
}

export interface EnqueueOptions {
  delay?: number;
  attempts?: number;
}

export interface QueueAdapter {
  enqueue(
    queueName: string,
    payload: JobPayload,
    options?: EnqueueOptions,
  ): Promise<void>;
}
