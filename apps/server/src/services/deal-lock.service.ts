import { and, eq, ne } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { NotifierAdapter, QueueAdapter } from "../adapters";
import type { Repositories } from "../db/repositories";
import { briefs, proposals } from "../db/schema";
import { AppError } from "../lib/errors";

export class DealLockService {
  constructor(
    private readonly db: PostgresJsDatabase,
    private readonly repos: Repositories,
    private readonly notifier: NotifierAdapter,
    private readonly queue: QueueAdapter,
  ) {}

  async lockDeal(
    briefId: string,
    proposalId: string,
    hostId: string,
  ): Promise<void> {
    const brief = await this.repos.briefs.findById(briefId);
    if (!brief) {
      throw new AppError("NOT_FOUND", "Brief not found");
    }
    if (brief.hostId !== hostId) {
      throw new AppError("FORBIDDEN", "Not your brief");
    }
    if (brief.status === "closed") {
      throw new AppError("BRIEF_CLOSED", "Brief is already closed");
    }

    await this.db.transaction(async (tx) => {
      const locked = await tx
        .update(proposals)
        .set({ status: "locked" })
        .where(
          and(
            eq(proposals.id, proposalId),
            eq(proposals.briefId, briefId),
            eq(proposals.status, "active"),
          ),
        )
        .returning({ id: proposals.id });

      if (locked.length === 0) {
        throw new AppError(
          "DEAL_LOCK_FAILED",
          "Could not lock proposal — brief may already be closed",
        );
      }

      await tx
        .update(proposals)
        .set({ status: "closed" })
        .where(
          and(eq(proposals.briefId, briefId), ne(proposals.id, proposalId)),
        );

      await tx
        .update(briefs)
        .set({ status: "closed", updatedAt: new Date() })
        .where(eq(briefs.id, briefId));
    });

    await this.queue.enqueue("email", {
      type: "proposal.accepted",
      briefId,
      proposalId,
    });
    await this.queue.enqueue("email", {
      type: "brief.closed",
      briefId,
      excludeProposalId: proposalId,
    });

    await this.notifier.emit(hostId, "deal.locked", { briefId, proposalId });
  }
}
