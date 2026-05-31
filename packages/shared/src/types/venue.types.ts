import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { venuePhotos, venues } from "@eventbid/server-schema";

export type Venue = InferSelectModel<typeof venues>;
export type CreateVenueInput = Omit<
  InferInsertModel<typeof venues>,
  "id" | "userId" | "createdAt" | "updatedAt" | "embedding"
>;
export type UpdateVenueInput = Partial<
  Omit<
    InferInsertModel<typeof venues>,
    "id" | "userId" | "createdAt" | "updatedAt" | "embedding"
  >
>;

export type VenuePhoto = InferSelectModel<typeof venuePhotos>;
export type CreateVenuePhotoInput = Omit<
  InferInsertModel<typeof venuePhotos>,
  "id" | "createdAt"
>;
