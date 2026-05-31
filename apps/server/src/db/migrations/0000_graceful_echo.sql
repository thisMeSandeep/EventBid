CREATE EXTENSION IF NOT EXISTS "pgcrypto";
--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS "vector";
--> statement-breakpoint
CREATE TABLE "ai_analyses" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid () NOT NULL,
    "brief_id" uuid NOT NULL,
    "status" text DEFAULT 'not_started' NOT NULL,
    "version_key" text,
    "results" jsonb,
    "created_at" timestamp
    with
        time zone DEFAULT now(),
        "updated_at" timestamp
    with
        time zone DEFAULT now(),
        CONSTRAINT "ai_analyses_brief_id_unique" UNIQUE ("brief_id")
);
--> statement-breakpoint
CREATE TABLE "brief_venue_matches" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid () NOT NULL,
    "brief_id" uuid NOT NULL,
    "venue_id" uuid NOT NULL,
    "match_score" real NOT NULL,
    "created_at" timestamp
    with
        time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "briefs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"host_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"event_date_from" date NOT NULL,
	"event_date_to" date NOT NULL,
	"time_of_day" text,
	"headcount" integer NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"budget_min" integer NOT NULL,
	"budget_max" integer NOT NULL,
	"requirements" text[],
	"description" text,
	"deadline" timestamp with time zone NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid () NOT NULL,
    "user_id" uuid NOT NULL,
    "type" text NOT NULL,
    "brief_id" uuid,
    "proposal_id" uuid,
    "venue_id" uuid,
    "read" boolean DEFAULT false NOT NULL,
    "created_at" timestamp
    with
        time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "proposals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brief_id" uuid NOT NULL,
	"venue_id" uuid NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"total_price" integer NOT NULL,
	"price_type" text NOT NULL,
	"inclusions" text[],
	"capacity_confirmed" boolean DEFAULT false NOT NULL,
	"catering_type" text,
	"amenities" text[],
	"availability_confirmed" boolean DEFAULT false NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "venue_photos" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid () NOT NULL,
    "venue_id" uuid NOT NULL,
    "r2_key" text,
    "url" text NOT NULL,
    "display_order" integer DEFAULT 0,
    "created_at" timestamp
    with
        time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "venues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"max_capacity" integer NOT NULL,
	"style_tags" text[],
	"amenities" text[],
	"event_types" text[],
	"phone" text,
	"email" text,
	"website" text,
	"embedding" vector(1536),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX "idx_bvm_venue_id" ON "brief_venue_matches" USING btree ("venue_id");
--> statement-breakpoint
CREATE INDEX "idx_bvm_brief_id" ON "brief_venue_matches" USING btree ("brief_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "idx_bvm_unique" ON "brief_venue_matches" USING btree ("brief_id", "venue_id");
--> statement-breakpoint
CREATE INDEX "idx_briefs_host_id" ON "briefs" USING btree ("host_id");
--> statement-breakpoint
CREATE INDEX "idx_briefs_status" ON "briefs" USING btree ("status");
--> statement-breakpoint
CREATE INDEX "idx_briefs_deadline" ON "briefs" USING btree ("deadline") WHERE "briefs"."status" = 'open';
--> statement-breakpoint
CREATE INDEX "idx_notifications_user_unread" ON "notifications" USING btree ("user_id") WHERE "notifications"."read" = false;
--> statement-breakpoint
CREATE INDEX "idx_notifications_brief_id" ON "notifications" USING btree ("brief_id");
--> statement-breakpoint
CREATE INDEX "idx_proposals_brief_id" ON "proposals" USING btree ("brief_id");
--> statement-breakpoint
CREATE INDEX "idx_proposals_venue_id" ON "proposals" USING btree ("venue_id");
--> statement-breakpoint
CREATE INDEX "idx_proposals_brief_status" ON "proposals" USING btree ("brief_id", "status");
--> statement-breakpoint
CREATE INDEX "idx_venues_embedding" ON "venues" USING hnsw ("embedding" vector_cosine_ops);