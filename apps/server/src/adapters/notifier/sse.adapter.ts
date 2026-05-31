import type { SSEStreamingApi } from "hono/streaming";
import type { NotifierAdapter } from "./notifier.adapter.interface";

export class SSENotifierAdapter implements NotifierAdapter {
  private streams = new Map<string, SSEStreamingApi>();

  register(userId: string, stream: SSEStreamingApi): void {
    this.streams.set(userId, stream);
  }

  unregister(userId: string): void {
    this.streams.delete(userId);
  }

  async emit(
    userId: string,
    event: string,
    data: Record<string, unknown>,
    options?: { id?: string },
  ): Promise<void> {
    const stream = this.streams.get(userId);
    if (!stream) {
      return;
    }

    await stream.writeSSE({
      id: options?.id,
      event,
      data: JSON.stringify(data),
    });
  }
}

export const notifier = new SSENotifierAdapter();
