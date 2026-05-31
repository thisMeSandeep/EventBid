import type {
  AIProvider,
  NotifierAdapter,
  QueueAdapter,
} from "../adapters";
import type { Repositories } from "../db/repositories";
import type { Brief, CreateBriefVenueMatchInput } from "@eventbid/shared";
import type { VenueEmbeddingScore } from "../db/repositories/venue.repository";

export class MatchingService {
  constructor(
    private readonly repos: Repositories,
    private readonly ai: AIProvider,
    private readonly queue: QueueAdapter,
    private readonly notifier: NotifierAdapter,
  ) {}

  async matchBriefToVenues(briefId: string): Promise<VenueEmbeddingScore[]> {
    const brief = await this.repos.briefs.findById(briefId);
    if (!brief) {
      throw new Error("Brief not found");
    }

    const hardMatches = await this.repos.venues.findByHardFilters({
      city: brief.city,
      minCapacity: brief.headcount,
      eventType: brief.eventType,
    });

    if (hardMatches.length === 0) {
      return [];
    }

    const briefEmbedding = await this.ai.embed(buildBriefEmbeddingDocument(brief));
    const scoredMatches = await this.repos.venues.scoreByEmbedding(
      hardMatches.map((venue) => venue.id),
      briefEmbedding,
    );

    await this.repos.briefVenueMatches.createBatch(
      scoredMatches.map(
        ({ venueId, score }): CreateBriefVenueMatchInput => ({
          briefId,
          venueId,
          matchScore: score,
        }),
      ),
    );

    await Promise.all(
      scoredMatches.map(async ({ venueId }) => {
        await this.queue.enqueue("email", {
          type: "brief.matched",
          briefId,
          venueId,
        });
        await this.notifier.emit(venueId, "brief.matched", { briefId });
      }),
    );

    return scoredMatches;
  }
}

function buildBriefEmbeddingDocument(brief: Brief): string {
  return [
    `Event type: ${brief.eventType}`,
    `Description: ${brief.description ?? ""}`,
    `Requirements: ${formatList(brief.requirements)}`,
    `Location: ${brief.city}, ${brief.state}`,
    `Headcount: ${brief.headcount}`,
    `Budget: ${brief.budgetMin} to ${brief.budgetMax}`,
    `Event date range: ${brief.eventDateFrom} to ${brief.eventDateTo}`,
    `Time of day: ${brief.timeOfDay ?? "not specified"}`,
  ].join("\n");
}

function formatList(values: string[] | null): string {
  if (!values || values.length === 0) {
    return "none specified";
  }

  return values.join(", ");
}
