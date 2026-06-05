import type {
  AIProvider,
  NotifierAdapter,
  QueueAdapter,
} from "../adapters";
import type { Repositories } from "../db/repositories";
import type { Brief, CreateBriefVenueMatchInput, Venue } from "@eventbid/shared";
import {
  buildBriefEmbeddingDocument,
  cosineSimilarity,
  isMatch,
  scoreMatch,
} from "./match-scoring";

export interface ScoredMatch {
  briefId: string;
  venueId: string;
  score: number;
}

export class MatchingService {
  constructor(
    private readonly repos: Repositories,
    private readonly ai: AIProvider,
    private readonly queue: QueueAdapter,
    private readonly notifier: NotifierAdapter,
  ) {}

  /** Forward matching: a brief was created or edited — find venues that fit. */
  async matchBriefToVenues(briefId: string): Promise<ScoredMatch[]> {
    const brief = await this.repos.briefs.findById(briefId);
    if (!brief) {
      throw new Error("Brief not found");
    }

    // Stage 1 — hard gate: city, event type, capacity.
    const candidates = await this.repos.venues.findByHardFilters({
      city: brief.city,
      minCapacity: brief.headcount,
      eventType: brief.eventType,
    });

    if (candidates.length === 0) {
      return [];
    }

    // Stage 2 — composite score. Embedding cosine comes from pgvector; the rest
    // (requirement coverage, capacity fit) is computed from the full objects.
    const briefEmbedding = await this.ai.embed(
      buildBriefEmbeddingDocument(brief),
    );
    const similarity = await this.semanticSimilarityByVenue(
      candidates,
      briefEmbedding,
    );

    const matches = candidates
      .map((venue) => ({
        venueId: venue.id,
        ...scoreMatch(brief, venue, similarity.get(venue.id) ?? 0),
      }))
      .filter((match) => isMatch(match.score));

    if (matches.length === 0) {
      return [];
    }

    const alreadyMatched = await this.repos.briefVenueMatches.findMatchedVenueIds(
      briefId,
      matches.map((match) => match.venueId),
    );

    await this.repos.briefVenueMatches.createBatch(
      matches.map(
        ({ venueId, score }): CreateBriefVenueMatchInput => ({
          briefId,
          venueId,
          matchScore: score,
        }),
      ),
    );

    // Notify only newly recorded matches, so re-matching after an edit refreshes
    // scores without re-emailing venues already matched.
    await Promise.all(
      matches
        .filter(({ venueId }) => !alreadyMatched.has(venueId))
        .map(async ({ venueId }) => {
          await this.queue.enqueue("email", {
            type: "brief.matched",
            briefId,
            venueId,
          });
          await this.notifier.emit(venueId, "brief.matched", { briefId });
        }),
    );

    return matches.map(({ venueId, score }) => ({ briefId, venueId, score }));
  }

  /** Reverse matching: a venue joined or edited its profile — find active briefs
   *  that fit, including older still-open ones. New matches notify the venue
   *  in-app only (no email). */
  async matchVenueToBriefs(venueId: string): Promise<ScoredMatch[]> {
    const venue = await this.repos.venues.findById(venueId);
    if (!venue?.embedding) {
      return [];
    }

    // Stage 1 — hard gate against active briefs only.
    const candidates = await this.repos.briefs.findActiveForVenue({
      city: venue.city,
      maxCapacity: venue.maxCapacity,
      eventTypes: venue.eventTypes ?? [],
    });

    if (candidates.length === 0) {
      return [];
    }

    // Stage 2 — composite score. Briefs aren't stored with embeddings, so embed
    // each candidate on the fly and cosine-compare to the venue's embedding.
    const venueEmbedding = venue.embedding;
    const matches = (
      await Promise.all(
        candidates.map(async (brief) => {
          const briefEmbedding = await this.ai.embed(
            buildBriefEmbeddingDocument(brief),
          );
          const similarity = cosineSimilarity(venueEmbedding, briefEmbedding);
          return {
            briefId: brief.id,
            ...scoreMatch(brief, venue, similarity),
          };
        }),
      )
    ).filter((match) => isMatch(match.score));

    if (matches.length === 0) {
      return [];
    }

    const alreadyMatched = await this.repos.briefVenueMatches.findMatchedBriefIds(
      venueId,
      matches.map((match) => match.briefId),
    );

    await this.repos.briefVenueMatches.createBatch(
      matches.map(
        ({ briefId, score }): CreateBriefVenueMatchInput => ({
          briefId,
          venueId,
          matchScore: score,
        }),
      ),
    );

    await Promise.all(
      matches
        .filter(({ briefId }) => !alreadyMatched.has(briefId))
        .map(({ briefId }) =>
          this.notifier.emit(venueId, "brief.matched", { briefId }),
        ),
    );

    return matches.map(({ briefId, score }) => ({ briefId, venueId, score }));
  }

  /** Map each candidate venue id to its embedding cosine similarity. */
  private async semanticSimilarityByVenue(
    venues: Venue[],
    briefEmbedding: number[],
  ): Promise<Map<string, number>> {
    const scores = await this.repos.venues.scoreByEmbedding(
      venues.map((venue) => venue.id),
      briefEmbedding,
    );
    return new Map(scores.map(({ venueId, score }) => [venueId, score]));
  }
}
