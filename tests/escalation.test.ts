import { describe, it } from "node:test";
import assert from "node:assert";
import request from "supertest";
import { app } from "../src/app.js";
import { db } from "../src/db/index.js";
import { listings, statusEvents } from "../src/db/schema.js";
import { eq } from "drizzle-orm";
import { ContractService } from "../src/services/contract.service.js";

describe("Alliance Scoping, Auto-Escalation & Lifecycle Tests", async () => {
  const timestamp = Date.now();
  const leaderEmail = `al_leader_${timestamp}@test.com`;
  const memberEmail = `al_member_${timestamp}@test.com`;
  const outsiderEmail = `outsider_${timestamp}@test.com`;

  let leaderToken: string;
  let leaderUserId: string;
  let memberToken: string;
  let memberUserId: string;
  let outsiderToken: string;
  let outsiderUserId: string;

  let allianceId: string;
  let allianceSlug = `alpha-wing-${timestamp}`;
  let internalListingId: string;

  it("Setup: Register test pilots", async () => {
    // 1. Leader
    const res1 = await request(app)
      .post("/api/auth/register")
      .send({
        email: leaderEmail,
        password: "Password123!",
        discord_username: `Leader_${timestamp}`,
        woa_player_id: `WOA-L-${timestamp}`,
        age_confirmed: true,
      });
    assert.strictEqual(res1.status, 201);
    leaderToken = res1.body.token;
    leaderUserId = res1.body.user.id;

    // 2. Member
    const res2 = await request(app)
      .post("/api/auth/register")
      .send({
        email: memberEmail,
        password: "Password123!",
        discord_username: `Member_${timestamp}`,
        woa_player_id: `WOA-M-${timestamp}`,
        age_confirmed: true,
      });
    assert.strictEqual(res2.status, 201);
    memberToken = res2.body.token;
    memberUserId = res2.body.user.id;

    // 3. Outsider
    const res3 = await request(app)
      .post("/api/auth/register")
      .send({
        email: outsiderEmail,
        password: "Password123!",
        discord_username: `Outsider_${timestamp}`,
        woa_player_id: `WOA-O-${timestamp}`,
        age_confirmed: true,
      });
    assert.strictEqual(res3.status, 201);
    outsiderToken = res3.body.token;
    outsiderUserId = res3.body.user.id;
  });

  it("Setup: Create alliance and assign member to IAD hub", async () => {
    const alRes = await request(app)
      .post("/api/alliances")
      .set("Authorization", `Bearer ${leaderToken}`)
      .send({
        name: "Alpha Wing Alliance",
        slug: allianceSlug,
        airport_model: "assigned",
        join_policy: "open",
        max_escalation_delay_hours: 12,
      });
    assert.strictEqual(alRes.status, 201);
    allianceId = alRes.body.alliance.id;

    // Member joins alliance
    const joinRes = await request(app)
      .post(`/api/alliances/${allianceSlug}/join`)
      .set("Authorization", `Bearer ${memberToken}`)
      .send({});
    assert.strictEqual(joinRes.status, 201);

    // Member assigns IAD as operated hub
    const hubRes = await request(app)
      .post(`/api/alliances/${allianceSlug}/airports`)
      .set("Authorization", `Bearer ${memberToken}`)
      .send({ airport_code: "IAD" });
    assert.strictEqual(hubRes.status, 201);
  });

  it("Test 1: Leader posts alliance-only flight contract", async () => {
    const res = await request(app)
      .post("/api/listings")
      .set("Authorization", `Bearer ${leaderToken}`)
      .send({
        contract_type: "outgoing",
        aircraft_class: "C",
        is_cargo: false,
        origin_airport: "PRG",
        destination_airport: "IAD",
        duration_hours: 24,
        alliance_id: allianceId,
        visibility: "alliance_only",
        auto_escalate_delay_hours: 6,
        notes: "Exclusive flight to partner hub IAD",
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.listing.visibility, "alliance_only");
    assert.strictEqual(res.body.listing.allianceId, allianceId);
    assert.strictEqual(res.body.listing.autoEscalateDelayHours, 6);
    internalListingId = res.body.listing.id;
    console.log("✓ Alliance-only listing created with 6h escalation delay");
  });

  it("Test 2: Audience scoping verification (ASVS Level 1)", async () => {
    // 1. Public query without auth must NOT include the alliance-only listing
    const pubRes = await request(app).get("/api/listings");
    assert.strictEqual(pubRes.status, 200);
    const pubFound = pubRes.body.listings.find((l: any) => l.id === internalListingId);
    assert.strictEqual(pubFound, undefined, "Public query must NOT return alliance_only listing");

    // 2. Outsider query specifying alliance_id must NOT see alliance_only listing
    const outsiderQueryRes = await request(app)
      .get(`/api/listings?alliance_id=${allianceId}`)
      .set("Authorization", `Bearer ${outsiderToken}`);
    assert.strictEqual(outsiderQueryRes.status, 200);
    const outsiderFound = outsiderQueryRes.body.listings.find((l: any) => l.id === internalListingId);
    assert.strictEqual(outsiderFound, undefined, "Non-member must not receive alliance_only listing");

    // 3. Outsider direct GET /:id must return 404
    const directGetRes = await request(app)
      .get(`/api/listings/${internalListingId}`)
      .set("Authorization", `Bearer ${outsiderToken}`);
    assert.strictEqual(directGetRes.status, 404, "Direct GET by non-member must return 404");

    // 4. Alliance member querying with alliance_id MUST see listing with partnerPriority flag
    const memberQueryRes = await request(app)
      .get(`/api/listings?alliance_id=${allianceId}`)
      .set("Authorization", `Bearer ${memberToken}`);
    assert.strictEqual(memberQueryRes.status, 200);
    const memberFound = memberQueryRes.body.listings.find((l: any) => l.id === internalListingId);
    assert.ok(memberFound, "Alliance member must receive the listing");
    assert.strictEqual(memberFound.partnerPriority, true, "Partner hub IAD must trigger partnerPriority = true");
    console.log("✓ ASVS Level 1 scoping and partner priority flag verified");
  });

  it("Test 3: Auto-escalation transitions contract to public marketplace", async () => {
    // Simulate escalation job execution
    await db
      .update(listings)
      .set({
        visibility: "public",
        escalatedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(listings.id, internalListingId));

    await db.insert(statusEvents).values({
      listingId: internalListingId,
      actorId: leaderUserId,
      fromStatus: "open",
      toStatus: "open",
      eventType: "escalated_public",
      notes: "Alliance private contract automatically escalated to the shared marketplace",
    });

    // Verify public query now includes the listing
    const pubRes = await request(app).get("/api/listings");
    assert.strictEqual(pubRes.status, 200);
    const pubFound = pubRes.body.listings.find((l: any) => l.id === internalListingId);
    assert.ok(pubFound, "Escalated listing must now appear on public marketplace");
    assert.strictEqual(pubFound.visibility, "public");

    // Outsider can now inspect details
    const outsiderGet = await request(app)
      .get(`/api/listings/${internalListingId}`)
      .set("Authorization", `Bearer ${outsiderToken}`);
    assert.strictEqual(outsiderGet.status, 200);
    console.log("✓ Escalation successfully made listing visible on public marketplace");
  });

  it("Test 4: Expiration cleanup (STAT-08)", async () => {
    // Create an expired listing
    const pastDate = new Date(Date.now() - 1000 * 60 * 60); // 1 hour ago
    const [expiredListing] = await db
      .insert(listings)
      .values({
        creatorId: leaderUserId,
        contractType: "incoming",
        aircraftClass: "B",
        isCargo: false,
        originAirport: "INN",
        destinationAirport: "BRI",
        status: "open",
        visibility: "public",
        expiresAt: pastDate,
      })
      .returning();

    // Run expiration cleanup
    const archived = await ContractService.archiveExpiredListings();
    const foundArchived = archived.find((a) => a.id === expiredListing.id);
    assert.ok(foundArchived, "Expired listing must be archived");
    assert.strictEqual(foundArchived.status, "expired");

    // Verify database state
    const [dbListing] = await db
      .select()
      .from(listings)
      .where(eq(listings.id, expiredListing.id));
    assert.strictEqual(dbListing.status, "expired");
    console.log("✓ Stale listing expiration cleanup verified");
  });
});
