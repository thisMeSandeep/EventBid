import type { AIProvider } from "../adapters";
import type { Repositories } from "../db/repositories";
import type { Venue } from "@eventbid/shared";

export class VenueEmbeddingService {
  constructor(
    private readonly repos: Repositories,
    private readonly ai: AIProvider,
  ) {}

  async generateAndStore(venueId: string): Promise<void> {
    const venue = await this.repos.venues.findById(venueId);
    if (!venue) {
      throw new Error("Venue not found");
    }

    const embedding = await this.ai.embed(buildVenueEmbeddingDocument(venue));
    await this.repos.venues.updateEmbedding(venueId, embedding);
  }
}

function buildVenueEmbeddingDocument(venue: Venue): string {
  return [
    `Venue: ${venue.name}`,
    `Description: ${venue.description ?? ""}`,
    `Style tags: ${formatList(venue.styleTags)}`,
    `Amenities: ${formatList(venue.amenities)}`,
    `Event types: ${formatList(venue.eventTypes)}`,
    `Location: ${venue.city}, ${venue.state}`,
    `Capacity: up to ${venue.maxCapacity} guests`,
  ].join("\n");
}

function formatList(values: string[] | null): string {
  if (!values || values.length === 0) {
    return "none specified";
  }

  return values.join(", ");
}
