import { eq, and, sql, desc, inArray, lte } from "drizzle-orm";
import { db } from "../db/index.js";
import {
  listings,
  listingClaims,
  statusEvents,
  airports,
  users,
  alliances,
  allianceMemberships,
  allianceAssignedAirports,
} from "../db/schema.js";
import type { CreateListingInput } from "../types/contract.js";
import { boss, isWorkerRunning } from "../jobs/worker.js";

export class ContractService {
  static async createListing(creatorId: string, input: CreateListingInput) {
    // Verify airport existence
    const [origin] = await db.select().from(airports).where(eq(airports.code, input.origin_airport));
    if (!origin) {
      const err = new Error(`Origin airport '${input.origin_airport}' does not exist in WoA database`);
      (err as any).statusCode = 400;
      throw err;
    }

    const [dest] = await db.select().from(airports).where(eq(airports.code, input.destination_airport));
    if (!dest) {
      const err = new Error(`Destination airport '${input.destination_airport}' does not exist in WoA database`);
      (err as any).statusCode = 400;
      throw err;
    }

    if (input.visibility === "alliance_only") {
      if (!input.alliance_id) {
        const err = new Error("Alliance ID is required for alliance-only contracts.");
        (err as any).statusCode = 400;
        throw err;
      }
      const [m] = await db
        .select()
        .from(allianceMemberships)
        .where(
          and(
            eq(allianceMemberships.allianceId, input.alliance_id),
            eq(allianceMemberships.userId, creatorId),
            eq(allianceMemberships.status, "active")
          )
        );
      if (!m) {
        const err = new Error("You must be an active member or guest of this alliance to post an alliance-scoped contract.");
        (err as any).statusCode = 403;
        throw err;
      }
    }

    const expiresAt = new Date(Date.now() + input.duration_hours * 60 * 60 * 1000);

    const [newListing] = await db
      .insert(listings)
      .values({
        creatorId,
        allianceId: input.alliance_id || null,
        contractType: input.contract_type,
        aircraftClass: input.aircraft_class,
        isCargo: input.is_cargo,
        originAirport: input.origin_airport,
        destinationAirport: input.destination_airport,
        notes: input.notes || null,
        expiresAt,
        status: "open",
        visibility: input.visibility || "public",
        autoEscalateDelayHours: input.auto_escalate_delay_hours || null,
      })
      .returning();

    // Initial audit event
    await db.insert(statusEvents).values({
      listingId: newListing.id,
      actorId: creatorId,
      fromStatus: null,
      toStatus: "open",
      eventType: "created",
      notes: input.visibility === "alliance_only" ? "Alliance contract listing created" : "Contract listing created",
    });

    // Schedule delayed escalation if alliance_only and autoEscalateDelayHours set
    if (isWorkerRunning && input.visibility === "alliance_only" && input.auto_escalate_delay_hours) {
      try {
        await boss.send(
          "escalate-alliance-listing",
          { listingId: newListing.id },
          { startAfter: input.auto_escalate_delay_hours * 3600 }
        );
      } catch (err) {
        console.warn("Could not schedule auto-escalation job:", err);
      }
    }

    return newListing;
  }

  static async getListings(filters: {
    airport?: string;
    aircraftClass?: string;
    contractType?: string;
    isCargo?: boolean;
    status?: string;
    allianceId?: string;
    currentUserId?: string;
  }) {
    const conditions = [];

    if (filters.status) {
      conditions.push(eq(listings.status, filters.status as any));
    } else {
      conditions.push(eq(listings.status, "open"));
    }

    if (filters.airport) {
      const ap = filters.airport.toUpperCase();
      conditions.push(
        sql`(${listings.originAirport} = ${ap} OR ${listings.destinationAirport} = ${ap})`
      );
    }

    if (filters.aircraftClass) {
      conditions.push(eq(listings.aircraftClass, filters.aircraftClass as any));
    }

    if (filters.contractType) {
      conditions.push(eq(listings.contractType, filters.contractType as any));
    }

    if (filters.isCargo !== undefined) {
      conditions.push(eq(listings.isCargo, filters.isCargo));
    }

    // Scoping rules (ALNC-05, D-05)
    let userAssignedAirports: string[] = [];
    if (filters.allianceId) {
      // Querying specifically inside an alliance workspace
      conditions.push(eq(listings.allianceId, filters.allianceId));
      let isAllianceMember = false;
      if (filters.currentUserId) {
        const [m] = await db
          .select()
          .from(allianceMemberships)
          .where(
            and(
              eq(allianceMemberships.allianceId, filters.allianceId),
              eq(allianceMemberships.userId, filters.currentUserId),
              eq(allianceMemberships.status, "active")
            )
          );
        if (m) {
          isAllianceMember = true;
          // Fetch user's assigned airports for partner priority calculation
          const userAirports = await db
            .select({ code: allianceAssignedAirports.airportCode })
            .from(allianceAssignedAirports)
            .where(
              and(
                eq(allianceAssignedAirports.allianceId, filters.allianceId),
                eq(allianceAssignedAirports.userId, filters.currentUserId)
              )
            );
          userAssignedAirports = userAirports.map((a) => a.code);
        }
      }
      if (!isAllianceMember) {
        // Non-member querying an alliance only sees public listings of that alliance
        conditions.push(eq(listings.visibility, "public"));
      }
    } else {
      // On public marketplace: strictly show public or escalated listings
      conditions.push(eq(listings.visibility, "public"));
    }

    const rows = await db
      .select({
        id: listings.id,
        contractType: listings.contractType,
        status: listings.status,
        visibility: listings.visibility,
        aircraftClass: listings.aircraftClass,
        isCargo: listings.isCargo,
        originAirport: listings.originAirport,
        destinationAirport: listings.destinationAirport,
        notes: listings.notes,
        expiresAt: listings.expiresAt,
        autoEscalateDelayHours: listings.autoEscalateDelayHours,
        escalatedAt: listings.escalatedAt,
        createdAt: listings.createdAt,
        creator: {
          id: users.id,
          discordUsername: users.discordUsername,
          woaPlayerId: users.woaPlayerId,
          reputationScore: users.reputationScore,
        },
        alliance: {
          id: alliances.id,
          name: alliances.name,
          slug: alliances.slug,
        },
      })
      .from(listings)
      .innerJoin(users, eq(listings.creatorId, users.id))
      .leftJoin(alliances, eq(listings.allianceId, alliances.id))
      .where(and(...conditions))
      .orderBy(desc(listings.createdAt));

    return rows.map((r) => ({
      ...r,
      partnerPriority: userAssignedAirports.includes(r.destinationAirport),
    }));
  }

  static async archiveExpiredListings() {
    const now = new Date();
    return await db
      .update(listings)
      .set({ status: "expired", updatedAt: now })
      .where(and(eq(listings.status, "open"), lte(listings.expiresAt, now)))
      .returning();
  }

  static async getListingById(listingId: string, currentUserId?: string) {
    const [listing] = await db
      .select({
        id: listings.id,
        creatorId: listings.creatorId,
        allianceId: listings.allianceId,
        contractType: listings.contractType,
        status: listings.status,
        visibility: listings.visibility,
        aircraftClass: listings.aircraftClass,
        isCargo: listings.isCargo,
        originAirport: listings.originAirport,
        destinationAirport: listings.destinationAirport,
        notes: listings.notes,
        expiresAt: listings.expiresAt,
        createdAt: listings.createdAt,
        updatedAt: listings.updatedAt,
        creator: {
          id: users.id,
          discordUsername: users.discordUsername,
          woaPlayerId: users.woaPlayerId,
          reputationScore: users.reputationScore,
        },
      })
      .from(listings)
      .innerJoin(users, eq(listings.creatorId, users.id))
      .where(eq(listings.id, listingId));

    if (!listing) {
      const err = new Error("Contract listing not found");
      (err as any).statusCode = 404;
      throw err;
    }

    if (listing.visibility === "alliance_only") {
      let isAllowed = false;
      if (currentUserId && listing.allianceId) {
        const [m] = await db
          .select()
          .from(allianceMemberships)
          .where(
            and(
              eq(allianceMemberships.allianceId, listing.allianceId),
              eq(allianceMemberships.userId, currentUserId),
              eq(allianceMemberships.status, "active")
            )
          );
        if (m) isAllowed = true;
      }
      if (!isAllowed) {
        const err = new Error("Contract listing not found");
        (err as any).statusCode = 404;
        throw err;
      }
    }

    const claims = await db
      .select({
        id: listingClaims.id,
        claimantId: listingClaims.claimantId,
        status: listingClaims.status,
        createdAt: listingClaims.createdAt,
        claimant: {
          id: users.id,
          discordUsername: users.discordUsername,
          woaPlayerId: users.woaPlayerId,
          reputationScore: users.reputationScore,
        },
      })
      .from(listingClaims)
      .innerJoin(users, eq(listingClaims.claimantId, users.id))
      .where(eq(listingClaims.listingId, listingId));

    const events = await db
      .select()
      .from(statusEvents)
      .where(eq(statusEvents.listingId, listingId))
      .orderBy(desc(statusEvents.createdAt));

    return {
      listing,
      claims,
      events,
    };
  }

  static async claimListing(listingId: string, claimantId: string) {
    return await db.transaction(async (tx) => {
      // Row-level lock on listing to serialize concurrent claims
      const [listing] = await tx
        .select()
        .from(listings)
        .where(eq(listings.id, listingId))
        .for("update");

      if (!listing) {
        const err = new Error("Listing not found");
        (err as any).statusCode = 404;
        throw err;
      }

      if (listing.status !== "open") {
        const err = new Error("Listing is no longer open for claims");
        (err as any).statusCode = 409;
        throw err;
      }

      if (listing.creatorId === claimantId) {
        const err = new Error("Cannot claim your own contract listing");
        (err as any).statusCode = 400;
        throw err;
      }

      const [claim] = await tx
        .insert(listingClaims)
        .values({
          listingId,
          claimantId,
          status: "pending",
        })
        .returning();

      await tx
        .update(listings)
        .set({ status: "claimed", updatedAt: new Date() })
        .where(eq(listings.id, listingId));

      await tx.insert(statusEvents).values({
        listingId,
        actorId: claimantId,
        fromStatus: "open",
        toStatus: "claimed",
        eventType: "claimed",
        notes: "Claim submitted by counterparty",
      });

      return claim;
    });
  }

  static async approveClaim(listingId: string, creatorId: string) {
    return await db.transaction(async (tx) => {
      const [listing] = await tx
        .select()
        .from(listings)
        .where(eq(listings.id, listingId))
        .for("update");

      if (!listing) {
        const err = new Error("Listing not found");
        (err as any).statusCode = 404;
        throw err;
      }

      if (listing.creatorId !== creatorId) {
        const err = new Error("Only the listing creator can approve claims");
        (err as any).statusCode = 403;
        throw err;
      }

      if (listing.status !== "claimed") {
        const err = new Error(`Cannot approve claim on listing with status '${listing.status}'`);
        (err as any).statusCode = 400;
        throw err;
      }

      const [pendingClaim] = await tx
        .select()
        .from(listingClaims)
        .where(and(eq(listingClaims.listingId, listingId), eq(listingClaims.status, "pending")));

      if (!pendingClaim) {
        const err = new Error("No pending claim found to approve");
        (err as any).statusCode = 404;
        throw err;
      }

      await tx
        .update(listingClaims)
        .set({ status: "accepted", updatedAt: new Date() })
        .where(eq(listingClaims.id, pendingClaim.id));

      await tx
        .update(listings)
        .set({ status: "in_progress", updatedAt: new Date() })
        .where(eq(listings.id, listingId));

      await tx.insert(statusEvents).values({
        listingId,
        actorId: creatorId,
        fromStatus: "claimed",
        toStatus: "in_progress",
        eventType: "approved",
        notes: "Creator approved claim; contract now in progress",
      });

      return { success: true, status: "in_progress" };
    });
  }

  static async reportDispatched(listingId: string, actorId: string) {
    return await db.transaction(async (tx) => {
      const [listing] = await tx
        .select()
        .from(listings)
        .where(eq(listings.id, listingId))
        .for("update");

      if (!listing || listing.status !== "in_progress") {
        const err = new Error("Contract is not currently in progress");
        (err as any).statusCode = 400;
        throw err;
      }

      const [activeClaim] = await tx
        .select()
        .from(listingClaims)
        .where(and(eq(listingClaims.listingId, listingId), eq(listingClaims.status, "accepted")));

      if (!activeClaim) {
        const err = new Error("No accepted active claim found");
        (err as any).statusCode = 400;
        throw err;
      }

      // Check who the sender is
      const senderId = listing.contractType === "outgoing" ? listing.creatorId : activeClaim.claimantId;
      if (actorId !== senderId) {
        const err = new Error("Only the flight sender can report dispatch");
        (err as any).statusCode = 403;
        throw err;
      }

      // Record dispatched event
      await tx.insert(statusEvents).values({
        listingId,
        actorId,
        fromStatus: listing.status,
        toStatus: listing.status,
        eventType: "dispatched_woa",
        notes: "Sender reported aircraft dispatched in-game",
      });

      // Check if accepted_woa already exists
      const [acceptedEvent] = await tx
        .select()
        .from(statusEvents)
        .where(and(eq(statusEvents.listingId, listingId), eq(statusEvents.eventType, "accepted_woa")));

      let finalStatus = "in_progress";
      if (acceptedEvent) {
        // Bilateral completion achieved!
        finalStatus = "completed";
        await tx
          .update(listings)
          .set({ status: "completed", updatedAt: new Date() })
          .where(eq(listings.id, listingId));

        await tx.insert(statusEvents).values({
          listingId,
          actorId,
          fromStatus: "in_progress",
          toStatus: "completed",
          eventType: "completed",
          notes: "Bilateral confirmation complete: flight dispatched & accepted",
        });
      }

      return { success: true, status: finalStatus, event: "dispatched_woa" };
    });
  }

  static async reportAccepted(listingId: string, actorId: string) {
    return await db.transaction(async (tx) => {
      const [listing] = await tx
        .select()
        .from(listings)
        .where(eq(listings.id, listingId))
        .for("update");

      if (!listing || listing.status !== "in_progress") {
        const err = new Error("Contract is not currently in progress");
        (err as any).statusCode = 400;
        throw err;
      }

      const [activeClaim] = await tx
        .select()
        .from(listingClaims)
        .where(and(eq(listingClaims.listingId, listingId), eq(listingClaims.status, "accepted")));

      if (!activeClaim) {
        const err = new Error("No accepted active claim found");
        (err as any).statusCode = 400;
        throw err;
      }

      // Check who the recipient is
      const recipientId = listing.contractType === "outgoing" ? activeClaim.claimantId : listing.creatorId;
      if (actorId !== recipientId) {
        const err = new Error("Only the flight recipient can report acceptance in-game");
        (err as any).statusCode = 403;
        throw err;
      }

      // Record accepted event
      await tx.insert(statusEvents).values({
        listingId,
        actorId,
        fromStatus: listing.status,
        toStatus: listing.status,
        eventType: "accepted_woa",
        notes: "Recipient reported contract accepted in-game",
      });

      // Check if dispatched_woa already exists
      const [dispatchedEvent] = await tx
        .select()
        .from(statusEvents)
        .where(and(eq(statusEvents.listingId, listingId), eq(statusEvents.eventType, "dispatched_woa")));

      let finalStatus = "in_progress";
      if (dispatchedEvent) {
        // Bilateral completion achieved!
        finalStatus = "completed";
        await tx
          .update(listings)
          .set({ status: "completed", updatedAt: new Date() })
          .where(eq(listings.id, listingId));

        await tx.insert(statusEvents).values({
          listingId,
          actorId,
          fromStatus: "in_progress",
          toStatus: "completed",
          eventType: "completed",
          notes: "Bilateral confirmation complete: flight dispatched & accepted",
        });
      }

      return { success: true, status: finalStatus, event: "accepted_woa" };
    });
  }

  static async cancelContract(listingId: string, actorId: string, reason: string) {
    return await db.transaction(async (tx) => {
      const [listing] = await tx
        .select()
        .from(listings)
        .where(eq(listings.id, listingId))
        .for("update");

      if (!listing) {
        const err = new Error("Listing not found");
        (err as any).statusCode = 404;
        throw err;
      }

      if (listing.status === "completed" || listing.status === "cancelled") {
        const err = new Error(`Cannot cancel contract with status '${listing.status}'`);
        (err as any).statusCode = 400;
        throw err;
      }

      const [activeClaim] = await tx
        .select()
        .from(listingClaims)
        .where(and(eq(listingClaims.listingId, listingId), sql`${listingClaims.status} IN ('pending', 'accepted')`));

      const isCreator = listing.creatorId === actorId;
      const isClaimant = activeClaim && activeClaim.claimantId === actorId;

      if (!isCreator && !isClaimant) {
        const err = new Error("Only involved contract parties can cancel");
        (err as any).statusCode = 403;
        throw err;
      }

      await tx
        .update(listings)
        .set({ status: "cancelled", updatedAt: new Date() })
        .where(eq(listings.id, listingId));

      if (activeClaim) {
        await tx
          .update(listingClaims)
          .set({ status: "cancelled", updatedAt: new Date() })
          .where(eq(listingClaims.id, activeClaim.id));
      }

      await tx.insert(statusEvents).values({
        listingId,
        actorId,
        fromStatus: listing.status,
        toStatus: "cancelled",
        eventType: "cancelled",
        notes: `Cancellation reason: ${reason}`,
      });

      return { success: true, status: "cancelled" };
    });
  }
}
