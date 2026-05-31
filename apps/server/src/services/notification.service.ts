import type { NotifierAdapter } from "../adapters";
import type { Repositories } from "../db/repositories";

export type NotificationType =
  | "proposal.received"
  | "analysis.ready"
  | "analysis.stale"
  | "brief.matched"
  | "proposal.accepted"
  | "brief.closed"
  | "brief.deadline_approaching"
  | "brief.expired";

export type NotificationRefs = {
  briefId?: string;
  proposalId?: string;
  venueId?: string;
};

export class NotificationService {
  constructor(
    private readonly repos: Repositories,
    private readonly notifier: NotifierAdapter,
  ) {}

  async notify(
    userId: string,
    type: NotificationType,
    refs: NotificationRefs,
  ): Promise<void> {
    const notification = await this.repos.notifications.create({
      userId,
      type,
      briefId: refs.briefId ?? null,
      proposalId: refs.proposalId ?? null,
      venueId: refs.venueId ?? null,
    });

    await this.notifier.emit(
      userId,
      type,
      {
        briefId: notification.briefId,
        proposalId: notification.proposalId,
        venueId: notification.venueId,
      },
      { id: notification.id },
    );
  }
}
