import { adapters } from "../adapters";
import { db } from "../db/client";
import { repositories } from "../db/repositories";
import { AnalysisService } from "./analysis.service";
import { BriefAIService } from "./brief-ai.service";
import { BriefAnalysisService } from "./brief-analysis.service";
import { DealLockService } from "./deal-lock.service";
import { MatchingService } from "./matching.service";
import { NotificationService } from "./notification.service";
import { ProposalAnalysisService } from "./proposal-analysis.service";
import { VenueEmbeddingService } from "./venue-embedding.service";

export const services = {
  venueEmbedding: new VenueEmbeddingService(repositories, adapters.ai),
  matching: new MatchingService(
    repositories,
    adapters.ai,
    adapters.queue,
    adapters.notifier,
  ),
  analysis: new AnalysisService(repositories, adapters.ai, adapters.notifier),
  proposalAnalysis: new ProposalAnalysisService(repositories, adapters.ai),
  briefAnalysis: new BriefAnalysisService(repositories, adapters.ai),
  dealLock: new DealLockService(
    db,
    repositories,
    adapters.notifier,
    adapters.queue,
  ),
  notification: new NotificationService(repositories, adapters.notifier),
  briefAI: new BriefAIService(adapters.ai),
};

export type Services = typeof services;

export {
  AnalysisService,
  BriefAIService,
  BriefAnalysisService,
  DealLockService,
  MatchingService,
  NotificationService,
  ProposalAnalysisService,
  VenueEmbeddingService,
};
