import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  vector,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const venues = pgTable(
  "venues",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    city: text("city").notNull(),
    state: text("state").notNull(),
    maxCapacity: integer("max_capacity").notNull(),
    styleTags: text("style_tags").array(), // e.g. ["modern", "rustic", "industrial"]
    amenities: text("amenities").array(), // e.g. ["wifi", "parking", "av_equipment"]
    eventTypes: text("event_types").array(), // e.g. ["wedding", "conference", "party"]
    phone: text("phone"),
    email: text("email"),
    website: text("website"),
    embedding: vector("embedding", { dimensions: 1536 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_venues_embedding").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops"),
    ),
  ],
);

export const venuePhotos = pgTable("venue_photos", {
  id: uuid("id").defaultRandom().primaryKey(),
  venueId: uuid("venue_id").notNull(),
  r2Key: text("r2_key"),
  url: text("url").notNull(),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const briefs = pgTable(
  "briefs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    hostId: uuid("host_id").notNull(),
    eventType: text("event_type").notNull(),
    eventDateFrom: date("event_date_from").notNull(),
    eventDateTo: date("event_date_to").notNull(),
    timeOfDay: text("time_of_day"), // e.g. "morning", "afternoon", "evening"
    headcount: integer("headcount").notNull(),
    city: text("city").notNull(),
    state: text("state").notNull(),
    budgetMin: integer("budget_min").notNull(),
    budgetMax: integer("budget_max").notNull(),
    requirements: text("requirements").array(), // e.g. ["outdoor_space", "av_equipment", "catering"]
    description: text("description"),
    deadline: timestamp("deadline", { withTimezone: true }).notNull(),
    status: text("status").notNull().default("open"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_briefs_host_id").on(table.hostId),
    index("idx_briefs_status").on(table.status),
    index("idx_briefs_deadline")
      .on(table.deadline)
      .where(sql`${table.status} = 'open'`),
  ],
);

export const proposals = pgTable(
  "proposals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    briefId: uuid("brief_id").notNull(),
    venueId: uuid("venue_id").notNull(),
    version: integer("version").notNull().default(1),
    status: text("status").notNull().default("active"),
    totalPrice: integer("total_price").notNull(),
    priceType: text("price_type").notNull(),
    inclusions: text("inclusions").array(),
    capacityConfirmed: boolean("capacity_confirmed").notNull().default(false),
    cateringType: text("catering_type"),
    amenities: text("amenities").array(),
    availabilityConfirmed: boolean("availability_confirmed")
      .notNull()
      .default(false),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_proposals_brief_id").on(table.briefId),
    index("idx_proposals_venue_id").on(table.venueId),
    index("idx_proposals_brief_status").on(table.briefId, table.status),
  ],
);

export const briefVenueMatches = pgTable(
  "brief_venue_matches",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    briefId: uuid("brief_id").notNull(),
    venueId: uuid("venue_id").notNull(),
    matchScore: real("match_score").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_bvm_venue_id").on(table.venueId),
    index("idx_bvm_brief_id").on(table.briefId),
    uniqueIndex("idx_bvm_unique").on(table.briefId, table.venueId),
  ],
);

export const aiAnalyses = pgTable("ai_analyses", {
  id: uuid("id").defaultRandom().primaryKey(),
  briefId: uuid("brief_id").notNull().unique(),
  status: text("status").notNull().default("not_started"),
  versionKey: text("version_key"),
  results: jsonb("results"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull(),
    type: text("type").notNull(),
    briefId: uuid("brief_id"),
    proposalId: uuid("proposal_id"),
    venueId: uuid("venue_id"),
    read: boolean("read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_notifications_user_unread")
      .on(table.userId)
      .where(sql`${table.read} = false`),
    index("idx_notifications_brief_id").on(table.briefId),
  ],
);
