export const amenities = [
  "indoor",
  "outdoor",
  "catering",
  "av",
  "parking",
  "accommodation",
  "photoshoot",
  "dj",
  "decor",
] as const;

export type Amenity = (typeof amenities)[number];
