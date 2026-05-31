import { and, desc, eq, lt, sql } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type {
  Brief,
  CreateBriefInput,
  UpdateBriefInput,
} from "@eventbid/shared";
import { briefs } from "../schema";

export class BriefRepository {
  constructor(private readonly db: PostgresJsDatabase) {}

  async findById(id: string): Promise<Brief | null> {
    const rows = await this.db
      .select()
      .from(briefs)
      .where(eq(briefs.id, id))
      .limit(1);

    return rows[0] ?? null;
  }

  async findByHostId(hostId: string, cursor?: string): Promise<Brief[]> {
    const whereClause = cursor
      ? and(eq(briefs.hostId, hostId), lt(briefs.id, cursor))
      : eq(briefs.hostId, hostId);

    return this.db
      .select()
      .from(briefs)
      .where(whereClause)
      .orderBy(desc(briefs.createdAt));
  }

  async findOpenPastDeadline(): Promise<Brief[]> {
    return this.db
      .select()
      .from(briefs)
      .where(
        and(eq(briefs.status, "open"), lt(briefs.deadline, sql`now()`)),
      );
  }

  async create(input: CreateBriefInput & { hostId: string }): Promise<Brief> {
    const rows = await this.db
      .insert(briefs)
      .values(input)
      .returning();

    return rows[0]!;
  }

  async update(id: string, input: UpdateBriefInput): Promise<Brief> {
    const rows = await this.db
      .update(briefs)
      .set(input)
      .where(eq(briefs.id, id))
      .returning();

    return rows[0]!;
  }

  async updateStatus(id: string, status: Brief["status"]): Promise<void> {
    await this.db
      .update(briefs)
      .set({ status })
      .where(eq(briefs.id, id));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(briefs).where(eq(briefs.id, id));
  }
}
