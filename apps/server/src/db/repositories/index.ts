import { db } from "../client";
import { AnalysisRepository } from "./analysis.repository";
import { BriefRepository } from "./brief.repository";
import { BriefVenueMatchRepository } from "./briefVenueMatch.repository";
import { NotificationRepository } from "./notification.repository";
import { ProposalRepository } from "./proposal.repository";
import { VenueRepository } from "./venue.repository";

export const repositories = {
  venues: new VenueRepository(db),
  briefs: new BriefRepository(db),
  proposals: new ProposalRepository(db),
  briefVenueMatches: new BriefVenueMatchRepository(db),
  analyses: new AnalysisRepository(db),
  notifications: new NotificationRepository(db),
};

export type Repositories = typeof repositories;

export {
  AnalysisRepository,
  BriefRepository,
  BriefVenueMatchRepository,
  NotificationRepository,
  ProposalRepository,
  VenueRepository,
};
