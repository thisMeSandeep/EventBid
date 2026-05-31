import { and, asc, desc, eq, gt, lt } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type {
  CreateNotificationInput,
  Notification,
} from "@eventbid/shared";
import { notifications } from "../schema";

export class NotificationRepository {
  constructor(private readonly db: PostgresJsDatabase) {}

  async create(input: CreateNotificationInput): Promise<Notification> {
    const rows = await this.db
      .insert(notifications)
      .values(input)
      .returning();

    return rows[0]!;
  }

  async findUnreadByUserId(
    userId: string,
    cursor?: string,
  ): Promise<Notification[]> {
    const whereClause = cursor
      ? and(
          eq(notifications.userId, userId),
          eq(notifications.read, false),
          lt(notifications.id, cursor),
        )
      : and(eq(notifications.userId, userId), eq(notifications.read, false));

    return this.db
      .select()
      .from(notifications)
      .where(whereClause)
      .orderBy(desc(notifications.createdAt));
  }

  async findAfter(userId: string, afterId: string): Promise<Notification[]> {
    const cursorRows = await this.db
      .select({ createdAt: notifications.createdAt })
      .from(notifications)
      .where(and(eq(notifications.id, afterId), eq(notifications.userId, userId)))
      .limit(1);
    const cursor = cursorRows[0];

    if (!cursor?.createdAt) {
      return [];
    }

    return this.db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          gt(notifications.createdAt, cursor.createdAt),
        ),
      )
      .orderBy(asc(notifications.createdAt));
  }

  async markRead(id: string, userId: string): Promise<void> {
    await this.db
      .update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
  }

  async markAllRead(userId: string): Promise<void> {
    await this.db
      .update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
  }
}
