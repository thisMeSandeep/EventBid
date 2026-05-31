import type { Brief } from "@eventbid/shared";
import type { JobDependencies } from "../engine";
import type { JobPayload } from "../../adapters/queue/queue.adapter.interface";

export async function deadlineHandler(
  _payload: JobPayload,
  { repositories, adapters }: JobDependencies,
): Promise<void> {
  const expiredBriefs = await repositories.briefs.findOpenPastDeadline();

  if (expiredBriefs.length === 0) {
    return;
  }

  console.log(`[jobs] Processing ${expiredBriefs.length} expired brief(s)`);

  for (const brief of expiredBriefs) {
    await repositories.briefs.updateStatus(brief.id, "expired");

    const matches = await repositories.briefVenueMatches.findByBriefId(brief.id);

    for (const match of matches) {
      const venue = await repositories.venues.findById(match.venueId);
      if (!venue?.email) {
        continue;
      }

      await adapters.email.send(venue.email, {
        type: "brief-expired",
        data: {
          recipientName: venue.name,
          briefTitle: formatBriefTitle(brief),
        },
      });
    }
  }
}

function formatBriefTitle(brief: Brief): string {
  return `${brief.eventType} in ${brief.city}`;
}
