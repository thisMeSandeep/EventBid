export const eventTypes = ["wedding", "birthday", "party", "other"] as const;
export type EventType = (typeof eventTypes)[number];
