CREATE TYPE "public"."aircraft_class" AS ENUM('A', 'B', 'C', 'D', 'E', 'F');--> statement-breakpoint
CREATE TYPE "public"."claim_status" AS ENUM('pending', 'accepted', 'rejected', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."contract_type" AS ENUM('outgoing', 'incoming');--> statement-breakpoint
CREATE TYPE "public"."listing_status" AS ENUM('open', 'claimed', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TABLE "airports" (
	"code" varchar(4) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"region" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listing_claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"claimant_id" uuid NOT NULL,
	"status" "claim_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid NOT NULL,
	"contract_type" "contract_type" NOT NULL,
	"status" "listing_status" DEFAULT 'open' NOT NULL,
	"aircraft_class" "aircraft_class" NOT NULL,
	"is_cargo" boolean DEFAULT false NOT NULL,
	"origin_airport" varchar(4) NOT NULL,
	"destination_airport" varchar(4) NOT NULL,
	"notes" text,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "status_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"actor_id" uuid NOT NULL,
	"from_status" varchar(50),
	"to_status" varchar(50) NOT NULL,
	"event_type" varchar(50) NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"discord_username" varchar(100) NOT NULL,
	"woa_player_id" varchar(100),
	"reputation_score" numeric(4, 2) DEFAULT '5.00' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "listing_claims" ADD CONSTRAINT "listing_claims_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_claims" ADD CONSTRAINT "listing_claims_claimant_id_users_id_fk" FOREIGN KEY ("claimant_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_origin_airport_airports_code_fk" FOREIGN KEY ("origin_airport") REFERENCES "public"."airports"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_destination_airport_airports_code_fk" FOREIGN KEY ("destination_airport") REFERENCES "public"."airports"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "status_events" ADD CONSTRAINT "status_events_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "status_events" ADD CONSTRAINT "status_events_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_single_active_claim" ON "listing_claims" USING btree ("listing_id") WHERE "listing_claims"."status" IN ('pending', 'accepted');