import type { SSEStreamingApi } from "hono/streaming";

export interface NotifierEmitOptions {
  id?: string;
}

export interface NotifierAdapter {
  emit(
    userId: string,
    event: string,
    data: Record<string, unknown>,
    options?: NotifierEmitOptions,
  ): Promise<void>;
  register(userId: string, stream: SSEStreamingApi): void;
  unregister(userId: string): void;
}
