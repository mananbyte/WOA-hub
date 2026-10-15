import { pgTable, uuid, varchar, text, numeric, boolean, timestamp, pgEnum, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const contractTypeEnum = pgEnum("contract_type", ["outgoing", "incoming"]);
export const listingStatusEnum = pgEnum("listing_status", ["open", "claimed", "in_progress", "completed", "cancelled"]);
export const claimStatusEnum = pgEnum("claim_status", ["pending", "accepted", "rejected", "cancelled"]);
export const aircraftClassEnum = pgEnum("aircraft_class", ["A", "B", "C", "D", "E", "F"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  discordUsername: varchar("discord_username", { length: 100 }).notNull(),
  woaPlayerId: varchar("woa_player_id", { length: 100 }),
  reputationScore: numeric("reputation_score", { precision: 4, scale: 2 }).default("5.00").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const airports = pgTable("airports", {
  code: varchar("code", { length: 4 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  region: varchar("region", { length: 50 }).notNull(),
});

export const listings = pgTable("listings", {
  id: uuid("id").defaultRandom().primaryKey(),
  creatorId: uuid("creator_id").references(() => users.id).notNull(),
  contractType: contractTypeEnum("contract_type").notNull(),
  status: listingStatusEnum("status").default("open").notNull(),
  aircraftClass: aircraftClassEnum("aircraft_class").notNull(),
  isCargo: boolean("is_cargo").default(false).notNull(),
  originAirport: varchar("origin_airport", { length: 4 }).references(() => airports.code).notNull(),
  destinationAirport: varchar("destination_airport", { length: 4 }).references(() => airports.code).notNull(),
  notes: text("notes"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const listingClaims = pgTable("listing_claims", {
  id: uuid("id").defaultRandom().primaryKey(),
  listingId: uuid("listing_id").references(() => listings.id).notNull(),
  claimantId: uuid("claimant_id").references(() => users.id).notNull(),
  status: claimStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("idx_single_active_claim")
    .on(table.listingId)
    .where(sql`${table.status} IN ('pending', 'accepted')`),
]);

export const statusEvents = pgTable("status_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  listingId: uuid("listing_id").references(() => listings.id).notNull(),
  actorId: uuid("actor_id").references(() => users.id).notNull(),
  fromStatus: varchar("from_status", { length: 50 }),
  toStatus: varchar("to_status", { length: 50 }).notNull(),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Airport = typeof airports.$inferSelect;
export type Listing = typeof listings.$inferSelect;
export type NewListing = typeof listings.$inferInsert;
export type ListingClaim = typeof listingClaims.$inferSelect;
export type NewListingClaim = typeof listingClaims.$inferInsert;
export type StatusEvent = typeof statusEvents.$inferSelect;
export type NewStatusEvent = typeof statusEvents.$inferInsert;
