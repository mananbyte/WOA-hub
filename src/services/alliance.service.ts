import { db } from "../db/index.js";
import {
  alliances,
  allianceMemberships,
  allianceAssignedAirports,
  airports,
  users,
  listings,
} from "../db/schema.js";
import { eq, and, sql, desc, count, inArray } from "drizzle-orm";
import type {
  CreateAllianceInput,
  UpdateAllianceInput,
} from "../types/alliance.js";

export class AllianceService {
  /**
   * Create a new alliance and establish creator as Owner
   */
  static async createAlliance(userId: string, input: CreateAllianceInput) {
    // Check if user already holds active primary membership in any alliance
    const [existingPrimary] = await db
      .select()
      .from(allianceMemberships)
      .where(
        and(
          eq(allianceMemberships.userId, userId),
          eq(allianceMemberships.status, "active"),
          inArray(allianceMemberships.role, ["owner", "admin", "member"])
        )
      );

    if (existingPrimary) {
      const err = new Error(
        "You already belong to an alliance. Pilots can only hold primary membership in one alliance at a time."
      );
      (err as any).statusCode = 409;
      throw err;
    }

    // Check slug uniqueness
    const [existingSlug] = await db
      .select()
      .from(alliances)
      .where(eq(alliances.slug, input.slug.toLowerCase()));

    if (existingSlug) {
      const err = new Error("An alliance with this slug already exists.");
      (err as any).statusCode = 409;
      throw err;
    }

    return await db.transaction(async (tx) => {
      const [newAlliance] = await tx
        .insert(alliances)
        .values({
          name: input.name,
          slug: input.slug.toLowerCase(),
          description: input.description || null,
          logoUrl: input.logo_url || null,
          discordUrl: input.discord_url || null,
          airportModel: input.airport_model,
          joinPolicy: input.join_policy,
          maxEscalationDelayHours: input.max_escalation_delay_hours,
          creatorId: userId,
        })
        .returning();

      // Automatically assign creator as active Owner
      await tx.insert(allianceMemberships).values({
        allianceId: newAlliance.id,
        userId,
        role: "owner",
        status: "active",
      });

      return newAlliance;
    });
  }

  /**
   * List directory of public alliances with member counts
   */
  static async getAlliances(filters: { model?: string; search?: string } = {}) {
    const conditions = [];

    if (filters.model) {
      conditions.push(eq(alliances.airportModel, filters.model as any));
    }
    if (filters.search) {
      const s = `%${filters.search.toLowerCase()}%`;
      conditions.push(sql`(LOWER(${alliances.name}) LIKE ${s} OR LOWER(${alliances.slug}) LIKE ${s})`);
    }

    const rows = await db
      .select({
        id: alliances.id,
        name: alliances.name,
        slug: alliances.slug,
        description: alliances.description,
        logoUrl: alliances.logoUrl,
        discordUrl: alliances.discordUrl,
        airportModel: alliances.airportModel,
        joinPolicy: alliances.joinPolicy,
        maxEscalationDelayHours: alliances.maxEscalationDelayHours,
        createdAt: alliances.createdAt,
        creator: {
          id: users.id,
          discordUsername: users.discordUsername,
        },
      })
      .from(alliances)
      .innerJoin(users, eq(alliances.creatorId, users.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(alliances.createdAt));

    // Fetch active member counts per alliance
    const counts = await db
      .select({
        allianceId: allianceMemberships.allianceId,
        count: count(allianceMemberships.id),
      })
      .from(allianceMemberships)
      .where(eq(allianceMemberships.status, "active"))
      .groupBy(allianceMemberships.allianceId);

    const countMap = new Map(counts.map((c) => [c.allianceId, Number(c.count)]));

    return rows.map((a) => ({
      ...a,
      activeMembersCount: countMap.get(a.id) || 0,
    }));
  }

  /**
   * Get alliance dossier by slug
   */
  static async getBySlug(slug: string, currentUserId?: string) {
    const [alliance] = await db
      .select({
        id: alliances.id,
        name: alliances.name,
        slug: alliances.slug,
        description: alliances.description,
        logoUrl: alliances.logoUrl,
        discordUrl: alliances.discordUrl,
        airportModel: alliances.airportModel,
        joinPolicy: alliances.joinPolicy,
        maxEscalationDelayHours: alliances.maxEscalationDelayHours,
        createdAt: alliances.createdAt,
        creator: {
          id: users.id,
          discordUsername: users.discordUsername,
          reputationScore: users.reputationScore,
        },
      })
      .from(alliances)
      .innerJoin(users, eq(alliances.creatorId, users.id))
      .where(eq(alliances.slug, slug.toLowerCase()));

    if (!alliance) {
      const err = new Error("Alliance not found.");
      (err as any).statusCode = 404;
      throw err;
    }

    // Active member count
    const [membersCount] = await db
      .select({ count: count(allianceMemberships.id) })
      .from(allianceMemberships)
      .where(
        and(
          eq(allianceMemberships.allianceId, alliance.id),
          eq(allianceMemberships.status, "active")
        )
      );

    // Caller membership status if authenticated
    let userMembership = null;
    if (currentUserId) {
      const [m] = await db
        .select()
        .from(allianceMemberships)
        .where(
          and(
            eq(allianceMemberships.allianceId, alliance.id),
            eq(allianceMemberships.userId, currentUserId)
          )
        );
      if (m) {
        userMembership = {
          role: m.role,
          status: m.status,
        };
      }
    }

    return {
      alliance,
      activeMembersCount: Number(membersCount?.count || 0),
      userMembership,
    };
  }

  /**
   * Join or apply for alliance membership
   */
  static async applyOrJoin(
    slug: string,
    userId: string,
    note?: string,
    inviteCode?: string
  ) {
    const { alliance } = await this.getBySlug(slug);

    // Check if user already holds a record in this alliance
    const [existingInAlliance] = await db
      .select()
      .from(allianceMemberships)
      .where(
        and(
          eq(allianceMemberships.allianceId, alliance.id),
          eq(allianceMemberships.userId, userId)
        )
      );

    if (existingInAlliance) {
      if (existingInAlliance.status === "active") {
        const err = new Error("You are already an active member of this alliance.");
        (err as any).statusCode = 400;
        throw err;
      }
      if (existingInAlliance.status === "pending") {
        const err = new Error("Your membership application is currently pending review.");
        (err as any).statusCode = 400;
        throw err;
      }
    }

    // Check single primary alliance rule (D-07)
    const [existingPrimary] = await db
      .select()
      .from(allianceMemberships)
      .where(
        and(
          eq(allianceMemberships.userId, userId),
          eq(allianceMemberships.status, "active"),
          inArray(allianceMemberships.role, ["owner", "admin", "member"])
        )
      );

    if (existingPrimary) {
      const err = new Error(
        "A pilot can only belong to one primary alliance as a member. You must leave your current alliance or join as a guest."
      );
      (err as any).statusCode = 409;
      throw err;
    }

    // Determine status based on join policy
    let status: "active" | "pending" = "pending";
    if (alliance.joinPolicy === "open") {
      status = "active";
    }

    const [membership] = await db
      .insert(allianceMemberships)
      .values({
        allianceId: alliance.id,
        userId,
        role: "member",
        status,
        applicationNote: note || null,
        inviteCode: inviteCode || null,
      })
      .returning();

    return membership;
  }

  /**
   * Register as an Alliance Guest Host (unlimited alliances allowed)
   */
  static async registerGuest(slug: string, userId: string) {
    const { alliance } = await this.getBySlug(slug);

    const [existing] = await db
      .select()
      .from(allianceMemberships)
      .where(
        and(
          eq(allianceMemberships.allianceId, alliance.id),
          eq(allianceMemberships.userId, userId)
        )
      );

    if (existing) {
      if (existing.status === "active") {
        return existing;
      }
      // Re-activate as guest
      const [updated] = await db
        .update(allianceMemberships)
        .set({ role: "guest", status: "active", updatedAt: new Date() })
        .where(eq(allianceMemberships.id, existing.id))
        .returning();
      return updated;
    }

    const [guest] = await db
      .insert(allianceMemberships)
      .values({
        allianceId: alliance.id,
        userId,
        role: "guest",
        status: "active",
      })
      .returning();

    return guest;
  }

  /**
   * Admin reviews membership application
   */
  static async reviewMembership(
    slug: string,
    actorId: string,
    targetUserId: string,
    newStatus: "active" | "rejected",
    newRole?: "admin" | "member" | "guest"
  ) {
    const { alliance } = await this.getBySlug(slug);

    // Verify actor is Owner or Admin
    const [actorMembership] = await db
      .select()
      .from(allianceMemberships)
      .where(
        and(
          eq(allianceMemberships.allianceId, alliance.id),
          eq(allianceMemberships.userId, actorId),
          eq(allianceMemberships.status, "active"),
          inArray(allianceMemberships.role, ["owner", "admin"])
        )
      );

    if (!actorMembership) {
      const err = new Error("Only alliance owners and administrators can review applications.");
      (err as any).statusCode = 403;
      throw err;
    }

    const [targetMembership] = await db
      .select()
      .from(allianceMemberships)
      .where(
        and(
          eq(allianceMemberships.allianceId, alliance.id),
          eq(allianceMemberships.userId, targetUserId)
        )
      );

    if (!targetMembership) {
      const err = new Error("Membership application not found.");
      (err as any).statusCode = 404;
      throw err;
    }

    // If approving as primary member, enforce single primary alliance rule
    const roleToSet = newRole || targetMembership.role;
    if (newStatus === "active" && ["owner", "admin", "member"].includes(roleToSet)) {
      const [existingPrimary] = await db
        .select()
        .from(allianceMemberships)
        .where(
          and(
            eq(allianceMemberships.userId, targetUserId),
            eq(allianceMemberships.status, "active"),
            inArray(allianceMemberships.role, ["owner", "admin", "member"]),
            sql`${allianceMemberships.allianceId} != ${alliance.id}`
          )
        );

      if (existingPrimary) {
        const err = new Error("Candidate already holds an active primary membership in another alliance.");
        (err as any).statusCode = 409;
        throw err;
      }
    }

    const [updated] = await db
      .update(allianceMemberships)
      .set({
        status: newStatus,
        role: roleToSet,
        updatedAt: new Date(),
      })
      .where(eq(allianceMemberships.id, targetMembership.id))
      .returning();

    return updated;
  }

  /**
   * Assign an operated airport hub to an alliance member (max 3 per pilot)
   */
  static async assignAirport(
    slug: string,
    actorId: string,
    targetUserId: string,
    airportCode: string
  ) {
    const { alliance } = await this.getBySlug(slug);

    // Verify actor is Admin/Owner or assigning to self
    if (actorId !== targetUserId) {
      const [actorMembership] = await db
        .select()
        .from(allianceMemberships)
        .where(
          and(
            eq(allianceMemberships.allianceId, alliance.id),
            eq(allianceMemberships.userId, actorId),
            eq(allianceMemberships.status, "active"),
            inArray(allianceMemberships.role, ["owner", "admin"])
          )
        );
      if (!actorMembership) {
        const err = new Error("Forbidden: Only alliance admins can assign airports to other pilots.");
        (err as any).statusCode = 403;
        throw err;
      }
    }

    // Verify target user is active member
    const [targetMembership] = await db
      .select()
      .from(allianceMemberships)
      .where(
        and(
          eq(allianceMemberships.allianceId, alliance.id),
          eq(allianceMemberships.userId, targetUserId),
          eq(allianceMemberships.status, "active"),
          inArray(allianceMemberships.role, ["owner", "admin", "member"])
        )
      );

    if (!targetMembership) {
      const err = new Error("Target pilot must be an active member of this alliance.");
      (err as any).statusCode = 400;
      throw err;
    }

    // Verify airport code exists
    const [ap] = await db
      .select()
      .from(airports)
      .where(eq(airports.code, airportCode.toUpperCase()));

    if (!ap) {
      const err = new Error(`Airport code '${airportCode}' is not a recognized World of Airports hub.`);
      (err as any).statusCode = 404;
      throw err;
    }

    // Check max 3 airports per pilot (D-01)
    const [userHubCount] = await db
      .select({ count: count(allianceAssignedAirports.id) })
      .from(allianceAssignedAirports)
      .where(
        and(
          eq(allianceAssignedAirports.allianceId, alliance.id),
          eq(allianceAssignedAirports.userId, targetUserId)
        )
      );

    if (Number(userHubCount?.count || 0) >= 3) {
      const err = new Error("Max 3 assigned airport hubs permitted per alliance member.");
      (err as any).statusCode = 400;
      throw err;
    }

    const [assignment] = await db
      .insert(allianceAssignedAirports)
      .values({
        allianceId: alliance.id,
        userId: targetUserId,
        airportCode: airportCode.toUpperCase(),
      })
      .returning();

    return assignment;
  }

  /**
   * Remove an assigned airport from a pilot
   */
  static async removeAssignedAirport(
    slug: string,
    actorId: string,
    targetUserId: string,
    airportCode: string
  ) {
    const { alliance } = await this.getBySlug(slug);

    if (actorId !== targetUserId) {
      const [actorMembership] = await db
        .select()
        .from(allianceMemberships)
        .where(
          and(
            eq(allianceMemberships.allianceId, alliance.id),
            eq(allianceMemberships.userId, actorId),
            eq(allianceMemberships.status, "active"),
            inArray(allianceMemberships.role, ["owner", "admin"])
          )
        );
      if (!actorMembership) {
        const err = new Error("Forbidden.");
        (err as any).statusCode = 403;
        throw err;
      }
    }

    await db
      .delete(allianceAssignedAirports)
      .where(
        and(
          eq(allianceAssignedAirports.allianceId, alliance.id),
          eq(allianceAssignedAirports.userId, targetUserId),
          eq(allianceAssignedAirports.airportCode, airportCode.toUpperCase())
        )
      );

    return { message: "Assigned hub removed successfully." };
  }

  /**
   * Calculate 10-hub Route Matrix and identify coverage gaps
   */
  static async getRouteMatrix(slug: string) {
    const { alliance } = await this.getBySlug(slug);

    // Get all official airports
    const officialAirports = await db.select().from(airports);

    // Get all assigned hubs for this alliance
    const assignments = await db
      .select({
        airportCode: allianceAssignedAirports.airportCode,
        userId: users.id,
        discordUsername: users.discordUsername,
        woaPlayerId: users.woaPlayerId,
        reputationScore: users.reputationScore,
      })
      .from(allianceAssignedAirports)
      .innerJoin(users, eq(allianceAssignedAirports.userId, users.id))
      .where(eq(allianceAssignedAirports.allianceId, alliance.id));

    // Group pilots by airport
    const hubMap = new Map<string, any[]>();
    for (const ap of officialAirports) {
      hubMap.set(ap.code, []);
    }
    for (const a of assignments) {
      if (hubMap.has(a.airportCode)) {
        hubMap.get(a.airportCode)!.push({
          id: a.userId,
          discordUsername: a.discordUsername,
          woaPlayerId: a.woaPlayerId,
          reputationScore: a.reputationScore,
        });
      }
    }

    // Count active alliance listings by origin/destination
    const activeListings = await db
      .select({
        origin: listings.originAirport,
        dest: listings.destinationAirport,
        contractType: listings.contractType,
      })
      .from(listings)
      .where(
        and(
          eq(listings.allianceId, alliance.id),
          inArray(listings.status, ["open", "claimed", "in_progress", "dispatched"])
        )
      );

    const matrix = officialAirports.map((ap) => {
      const pilots = hubMap.get(ap.code) || [];
      const outgoingCount = activeListings.filter((l) => l.origin === ap.code).length;
      const incomingNeedCount = activeListings.filter((l) => l.dest === ap.code).length;

      let status: "covered" | "unassigned" | "bottleneck" = "unassigned";
      if (pilots.length > 0) {
        status = incomingNeedCount > pilots.length * 3 ? "bottleneck" : "covered";
      }

      return {
        code: ap.code,
        name: ap.name,
        region: ap.region,
        pilots,
        outgoingCount,
        incomingNeedCount,
        status,
        hasGap: pilots.length === 0,
      };
    });

    return {
      alliance,
      matrix,
      totalCoveredHubs: matrix.filter((m) => m.pilots.length > 0).length,
      totalOfficialHubs: officialAirports.length,
      uncoveredGaps: matrix.filter((m) => m.hasGap).map((m) => m.code),
    };
  }

  /**
   * Get members roster for an alliance
   */
  static async getMembers(slug: string) {
    const { alliance } = await this.getBySlug(slug);

    const members = await db
      .select({
        id: users.id,
        discordUsername: users.discordUsername,
        woaPlayerId: users.woaPlayerId,
        reputationScore: users.reputationScore,
        role: allianceMemberships.role,
        status: allianceMemberships.status,
        joinedAt: allianceMemberships.createdAt,
      })
      .from(allianceMemberships)
      .innerJoin(users, eq(allianceMemberships.userId, users.id))
      .where(eq(allianceMemberships.allianceId, alliance.id))
      .orderBy(allianceMemberships.role, desc(allianceMemberships.createdAt));

    // Get assigned airports for members
    const assignments = await db
      .select({
        userId: allianceAssignedAirports.userId,
        airportCode: allianceAssignedAirports.airportCode,
      })
      .from(allianceAssignedAirports)
      .where(eq(allianceAssignedAirports.allianceId, alliance.id));

    const apMap = new Map<string, string[]>();
    for (const a of assignments) {
      if (!apMap.has(a.userId)) apMap.set(a.userId, []);
      apMap.get(a.userId)!.push(a.airportCode);
    }

    return members.map((m) => ({
      ...m,
      assignedAirports: apMap.get(m.id) || [],
    }));
  }

  /**
   * Update alliance settings (Admin/Owner only)
   */
  static async updateAlliance(
    slug: string,
    actorId: string,
    input: UpdateAllianceInput
  ) {
    const { alliance } = await this.getBySlug(slug);

    // Verify actor is Owner or Admin
    const [actorMembership] = await db
      .select()
      .from(allianceMemberships)
      .where(
        and(
          eq(allianceMemberships.allianceId, alliance.id),
          eq(allianceMemberships.userId, actorId),
          eq(allianceMemberships.status, "active"),
          inArray(allianceMemberships.role, ["owner", "admin"])
        )
      );

    if (!actorMembership) {
      const err = new Error("Only alliance owners and administrators can update group settings.");
      (err as any).statusCode = 403;
      throw err;
    }

    const [updated] = await db
      .update(alliances)
      .set({
        name: input.name !== undefined ? input.name : alliance.name,
        description: input.description !== undefined ? input.description : alliance.description,
        logoUrl: input.logo_url !== undefined ? (input.logo_url || null) : alliance.logoUrl,
        discordUrl: input.discord_url !== undefined ? (input.discord_url || null) : alliance.discordUrl,
        airportModel: input.airport_model !== undefined ? input.airport_model : alliance.airportModel,
        joinPolicy: input.join_policy !== undefined ? input.join_policy : alliance.joinPolicy,
        maxEscalationDelayHours:
          input.max_escalation_delay_hours !== undefined
            ? input.max_escalation_delay_hours
            : alliance.maxEscalationDelayHours,
        updatedAt: new Date(),
      })
      .where(eq(alliances.id, alliance.id))
      .returning();

    return updated;
  }
}

