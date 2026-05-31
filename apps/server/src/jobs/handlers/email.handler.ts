import type { Brief } from "@eventbid/shared";
import type { JobDependencies } from "../engine";
import type { JobPayload } from "../../adapters/queue/queue.adapter.interface";

export async function emailHandler(
  payload: JobPayload,
  { repositories, adapters }: JobDependencies,
): Promise<void> {
  switch (payload.type) {
    case "brief.matched":
      await sendBriefMatchedEmail(payload, repositories, adapters);
      return;
    case "proposal.accepted":
      await sendProposalAcceptedEmail(payload, repositories, adapters);
      return;
    case "brief.closed":
      await sendBriefClosedEmails(payload, repositories, adapters);
      return;
    default:
      throw new Error(`Unknown email job type: ${payload.type}`);
  }
}

async function sendBriefMatchedEmail(
  payload: JobPayload,
  repositories: JobDependencies["repositories"],
  adapters: JobDependencies["adapters"],
): Promise<void> {
  const briefId = payload.briefId as string;
  const venueId = payload.venueId as string;

  const [brief, venue] = await Promise.all([
    repositories.briefs.findById(briefId),
    repositories.venues.findById(venueId),
  ]);

  if (!brief || !venue?.email) {
    return;
  }

  await adapters.email.send(venue.email, {
    type: "new-brief-match",
    data: {
      venueName: venue.name,
      eventType: brief.eventType,
      city: brief.city,
      eventDate: formatEventDate(brief),
      briefTitle: formatBriefTitle(brief),
    },
  });
}

async function sendProposalAcceptedEmail(
  payload: JobPayload,
  repositories: JobDependencies["repositories"],
  adapters: JobDependencies["adapters"],
): Promise<void> {
  const briefId = payload.briefId as string;
  const proposalId = payload.proposalId as string;

  const proposal = await repositories.proposals.findById(proposalId);
  if (!proposal) {
    return;
  }

  const [brief, venue] = await Promise.all([
    repositories.briefs.findById(briefId),
    repositories.venues.findById(proposal.venueId),
  ]);

  if (!brief || !venue?.email) {
    return;
  }

  await adapters.email.send(venue.email, {
    type: "proposal-accepted",
    data: {
      venueName: venue.name,
      briefTitle: formatBriefTitle(brief),
      eventDate: formatEventDate(brief),
    },
  });
}

async function sendBriefClosedEmails(
  payload: JobPayload,
  repositories: JobDependencies["repositories"],
  adapters: JobDependencies["adapters"],
): Promise<void> {
  const briefId = payload.briefId as string;
  const excludeProposalId = payload.excludeProposalId as string;

  const [brief, proposals] = await Promise.all([
    repositories.briefs.findById(briefId),
    repositories.proposals.findByBriefIdWithVenue(briefId),
  ]);

  if (!brief) {
    return;
  }

  const notifiedEmails = new Set<string>();

  for (const proposal of proposals) {
    if (proposal.id === excludeProposalId || !proposal.venueEmail) {
      continue;
    }

    if (notifiedEmails.has(proposal.venueEmail)) {
      continue;
    }

    notifiedEmails.add(proposal.venueEmail);

    await adapters.email.send(proposal.venueEmail, {
      type: "brief-closed",
      data: {
        venueName: proposal.venueName,
        briefTitle: formatBriefTitle(brief),
        eventType: brief.eventType,
      },
    });
  }
}

function formatBriefTitle(brief: Brief): string {
  return `${brief.eventType} in ${brief.city}`;
}

function formatEventDate(brief: Brief): string {
  if (brief.eventDateFrom === brief.eventDateTo) {
    return brief.eventDateFrom;
  }

  return `${brief.eventDateFrom} to ${brief.eventDateTo}`;
}
