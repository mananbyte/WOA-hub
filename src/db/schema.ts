import { pgTable, uuid, varchar, text, numeric, boolean, timestamp, pgEnum, uniqueIndex, integer } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const contractTypeEnum = pgEnum("contract_type", ["outgoing", "incoming"]);
export const listingStatusEnum = pgEnum("listing_status", ["open", "claimed", "in_progress", "dispatched", "accepted", "completed", "cancelled", "expired"]);
export const claimStatusEnum = pgEnum("claim_status", ["pending", "accepted", "rejected", "cancelled"]);
export const aircraftClassEnum = pgEnum("aircraft_class", ["A", "B", "C", "D", "E", "F"]);

export const airportModelEnum = pgEnum("airport_model", ["assigned", "flexible", "hybrid"]);
export const joinPolicyEnum = pgEnum("join_policy", ["open", "approval", "invite_only"]);
export const allianceRoleEnum = pgEnum("alliance_role", ["owner", "admin", "member", "guest"]);
export const membershipStatusEnum = pgEnum("membership_status", ["active", "pending", "rejected"]);
export const listingVisibilityEnum = pgEnum("listing_visibility", ["public", "alliance_only"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  discordUsername: varchar("discord_username", { length: 100 }).notNull(),
  woaPlayerId: varchar("woa_player_id", { length: 100 }),
  reputationScore: numeric("reputation_score", { precision: 4, scale: 2 }).default("5.00").notNull(),
  totalCompletedContracts: integer("total_completed_contracts").default(0).notNull(),
  totalCancelledContracts: integer("total_cancelled_contracts").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const airports = pgTable("airports", {
  code: varchar("code", { length: 4 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  region: varchar("region", { length: 50 }).notNull(),
});

export const alliances = pgTable("alliances", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  logoUrl: varchar("logo_url", { length: 500 }),
  discordUrl: varchar("discord_url", { length: 255 }),
  airportModel: airportModelEnum("airport_model").default("flexible").notNull(),
  joinPolicy: joinPolicyEnum("join_policy").default("approval").notNull(),
  maxEscalationDelayHours: integer("max_escalation_delay_hours").default(24).notNull(),
  creatorId: uuid("creator_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const allianceMemberships = pgTable("alliance_memberships", {
  id: uuid("id").defaultRandom().primaryKey(),
  allianceId: uuid("alliance_id").references(() => alliances.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  role: allianceRoleEnum("role").default("member").notNull(),
  status: membershipStatusEnum("status").default("pending").notNull(),
  applicationNote: text("application_note"),
  inviteCode: varchar("invite_code", { length: 100 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("idx_single_primary_alliance")
    .on(table.userId)
    .where(sql`${table.role} IN ('owner', 'admin', 'member') AND ${table.status} = 'active'`),
  uniqueIndex("idx_alliance_user_unique")
    .on(table.allianceId, table.userId),
]);

export const allianceAssignedAirports = pgTable("alliance_assigned_airports", {
  id: uuid("id").defaultRandom().primaryKey(),
  allianceId: uuid("alliance_id").references(() => alliances.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  airportCode: varchar("airport_code", { length: 4 }).references(() => airports.code).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("idx_alliance_user_airport_unique")
    .on(table.allianceId, table.userId, table.airportCode),
]);

export const listings = pgTable("listings", {
  id: uuid("id").defaultRandom().primaryKey(),
  creatorId: uuid("creator_id").references(() => users.id).notNull(),
  allianceId: uuid("alliance_id").references(() => alliances.id),
  contractType: contractTypeEnum("contract_type").notNull(),
  status: listingStatusEnum("status").default("open").notNull(),
  visibility: listingVisibilityEnum("visibility").default("public").notNull(),
  aircraftClass: aircraftClassEnum("aircraft_class").notNull(),
  isCargo: boolean("is_cargo").default(false).notNull(),
  originAirport: varchar("origin_airport", { length: 4 }).references(() => airports.code).notNull(),
  destinationAirport: varchar("destination_airport", { length: 4 }).references(() => airports.code).notNull(),
  notes: text("notes"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  autoEscalateDelayHours: integer("auto_escalate_delay_hours"),
  escalatedAt: timestamp("escalated_at", { withTimezone: true }),
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
  actorId: uuid("actor_id").references(() => users.id),
  fromStatus: varchar("from_status", { length: 50 }),
  toStatus: varchar("to_status", { length: 50 }).notNull(),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Airport = typeof airports.$inferSelect;
export type Alliance = typeof alliances.$inferSelect;
export type NewAlliance = typeof alliances.$inferInsert;
export type AllianceMembership = typeof allianceMemberships.$inferSelect;
export type NewAllianceMembership = typeof allianceMemberships.$inferInsert;
export type AllianceAssignedAirport = typeof allianceAssignedAirports.$inferSelect;
export type NewAllianceAssignedAirport = typeof allianceAssignedAirports.$inferInsert;
export type Listing = typeof listings.$inferSelect;
export type NewListing = typeof listings.$inferInsert;
export type ListingClaim = typeof listingClaims.$inferSelect;
export type NewListingClaim = typeof listingClaims.$inferInsert;
export type StatusEvent = typeof statusEvents.$inferSelect;
export type NewStatusEvent = typeof statusEvents.$inferInsert;
