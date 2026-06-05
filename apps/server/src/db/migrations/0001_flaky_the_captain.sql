CREATE TABLE "brief_analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brief_id" uuid NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"summary" text,
	"key_requirements" jsonb,
	"tips" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "brief_analyses_brief_id_unique" UNIQUE("brief_id")
);
--> statement-breakpoint
CREATE TABLE "proposal_analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proposal_id" uuid NOT NULL,
	"brief_id" uuid NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"score" integer,
	"sub_scores" jsonb,
	"summary" text,
	"gaps" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "proposal_analyses_proposal_id_unique" UNIQUE("proposal_id")
);
--> statement-breakpoint
ALTER TABLE "briefs" ALTER COLUMN "host_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "venues" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
CREATE INDEX "idx_proposal_analyses_brief_id" ON "proposal_analyses" USING btree ("brief_id");