import { describe, it } from "node:test";
import assert from "node:assert";
import request from "supertest";
import { app } from "../src/app.js";
import { db } from "../src/db/index.js";
import { airports, listings, statusEvents, allianceMemberships, allianceAssignedAirports } from "../src/db/schema.js";
import { eq, inArray } from "drizzle-orm";

describe("Alliance Guest Request Protocol, 18-Airport Network & Directional Filter Tests", async () => {
  const timestamp = Date.now();
  const leaderEmail = `flow_leader_${timestamp}@test.com`;
  const memberEmail = `flow_member_${timestamp}@test.com`;
  const guestEmail = `flow_guest_${timestamp}@test.com`;

  let leaderToken: string;
  let leaderUserId: string;
  let memberToken: string;
  let memberUserId: string;
  let guestToken: string;
  let guestUserId: string;

  let allianceId: string;
  let allianceSlug = `flow-consortium-${timestamp}`;

  it("1. Verify all 18 official World of Airports playable hubs exist in database", async () => {
    const expectedHubs = [
      "INN", "BRI", "PRG", "IAD", "NGO", "SAN",
      "MCT", "LEJ", "SXM", "LHR", "SYD", "BKK",
      "MSY", "HKG", "ZRH", "CNN", "GRU", "SCL"
    ];

    const dbAirports = await db
      .select({ code: airports.code })
      .from(airports)
      .where(inArray(airports.code, expectedHubs));

    const foundCodes = dbAirports.map((a) => a.code);
    for (const code of expectedHubs) {
      assert.ok(foundCodes.includes(code), `Airport ${code} should be present in database`);
    }
    console.log(`✓ Verified all ${expectedHubs.length} official WoA hubs exist in database`);
  });

  it("2. Setup test users and alliance structure", async () => {
    // Register leader
    const resL = await request(app)
      .post("/api/auth/register")
      .send({
        email: leaderEmail,
        password: "Password123!",
        discord_username: `Leader_${timestamp}`,
        woa_player_id: `WOA-L-${timestamp}`,
        age_confirmed: true,
      });
    assert.strictEqual(resL.status, 201);
    leaderToken = resL.body.token;
    leaderUserId = resL.body.user.id;

    // Register member
    const resM = await request(app)
      .post("/api/auth/register")
      .send({
        email: memberEmail,
        password: "Password123!",
        discord_username: `Member_${timestamp}`,
        woa_player_id: `WOA-M-${timestamp}`,
        age_confirmed: true,
      });
    assert.strictEqual(resM.status, 201);
    memberToken = resM.body.token;
    memberUserId = resM.body.user.id;

    // Register guest
    const resG = await request(app)
      .post("/api/auth/register")
      .send({
        email: guestEmail,
        password: "Password123!",
        discord_username: `Guest_${timestamp}`,
        woa_player_id: `WOA-G-${timestamp}`,
        age_confirmed: true,
      });
    assert.strictEqual(resG.status, 201);
    guestToken = resG.body.token;
    guestUserId = resG.body.user.id;

    // Leader creates open alliance
    const resAl = await request(app)
      .post("/api/alliances")
      .set("Authorization", `Bearer ${leaderToken}`)
      .send({
        name: `Skyline Flow ${timestamp}`,
        slug: allianceSlug,
        airport_model: "assigned",
        join_policy: "open",
        max_escalation_delay_hours: 12,
      });
    assert.strictEqual(resAl.status, 201);
    allianceId = resAl.body.alliance.id;

    // Member joins alliance as active member
    const resJoinM = await request(app)
      .post(`/api/alliances/${allianceSlug}/join`)
      .set("Authorization", `Bearer ${memberToken}`)
      .send({});
    assert.strictEqual(resJoinM.status, 201);

    // Member assigns PRG as operating hub
    const resHub = await request(app)
      .post(`/api/alliances/${allianceSlug}/airports`)
      .set("Authorization", `Bearer ${memberToken}`)
      .send({ airport_code: "PRG" });
    assert.strictEqual(resHub.status, 201);

    // Guest joins alliance as guest host
    const resGuestJoin = await request(app)
      .post(`/api/alliances/${allianceSlug}/guest`)
      .set("Authorization", `Bearer ${guestToken}`)
      .send({});
    assert.strictEqual(resGuestJoin.status, 201);
    assert.strictEqual(resGuestJoin.body.membership.role, "guest");
    console.log("✓ Alliance created, member assigned PRG hub, and guest joined successfully");
  });

  it("3. Direction-aware airport filtering & renewal flag persistence", async () => {
    // Create Outgoing flight departing from IAD (Origin = IAD, Destination = PRG) with renewal: true
    const resOut = await request(app)
      .post("/api/listings")
      .set("Authorization", `Bearer ${leaderToken}`)
      .send({
        contract_type: "outgoing",
        origin_airport: "IAD",
        destination_airport: "PRG",
        aircraft_class: "E",
        is_cargo: false,
        renewal: true,
        duration_hours: 24,
      });
    assert.strictEqual(resOut.status, 201);
    assert.strictEqual(resOut.body.listing.renewal, true);
    const outgoingId = resOut.body.listing.id;

    // Create Incoming turnaround landing at IAD (Origin = SAN, Destination = IAD) with renewal: false
    const resIn = await request(app)
      .post("/api/listings")
      .set("Authorization", `Bearer ${memberToken}`)
      .send({
        contract_type: "incoming",
        origin_airport: "SAN",
        destination_airport: "IAD",
        aircraft_class: "C",
        is_cargo: false,
        renewal: false,
        duration_hours: 24,
      });
    assert.strictEqual(resIn.status, 201);
    assert.strictEqual(resIn.body.listing.renewal, false);
    const incomingId = resIn.body.listing.id;

    // Test 3a: Filter by airport=IAD & type=outgoing -> must ONLY return outgoingId (originAirport = IAD)
    const filterOutRes = await request(app)
      .get("/api/listings?airport=IAD&type=outgoing");
    assert.strictEqual(filterOutRes.status, 200);
    const outListings = filterOutRes.body.listings;
    assert.ok(outListings.some((l: any) => l.id === outgoingId), "Outgoing listing departing from IAD should be present");
    assert.ok(!outListings.some((l: any) => l.id === incomingId), "Incoming listing landing at IAD must NOT match outgoing filter");

    // Test 3b: Filter by airport=IAD & type=incoming -> must ONLY return incomingId (destinationAirport = IAD)
    const filterInRes = await request(app)
      .get("/api/listings?airport=IAD&type=incoming");
    assert.strictEqual(filterInRes.status, 200);
    const inListings = filterInRes.body.listings;
    assert.ok(inListings.some((l: any) => l.id === incomingId), "Incoming listing landing at IAD should be present");
    assert.ok(!inListings.some((l: any) => l.id === outgoingId), "Outgoing listing departing from IAD must NOT match incoming filter");

    // Test 3c: Filter by airport=IAD with no direction specified -> returns both listings touching IAD
    const filterAllRes = await request(app)
      .get("/api/listings?airport=IAD");
    assert.strictEqual(filterAllRes.status, 200);
    const allListings = filterAllRes.body.listings;
    assert.ok(allListings.some((l: any) => l.id === outgoingId), "Outgoing listing touching IAD should be present");
    assert.ok(allListings.some((l: any) => l.id === incomingId), "Incoming listing touching IAD should be present");

    // Test 3d: Verify renewal badge persistence in detail query
    const detailRes = await request(app).get(`/api/listings/${outgoingId}`);
    assert.strictEqual(detailRes.status, 200);
    assert.strictEqual(detailRes.body.listing.renewal, true);

    console.log("✓ Direction-aware airport filtering verified: incoming strictly matches destination, outgoing strictly matches origin");
    console.log("✓ Renewal flag correctly persisted and exposed via REST endpoints");
  });

  it("4. Alliance guest aircraft request and partial dispatch lifecycle", async () => {
    // Guest posts an incoming turnaround contract request inside the alliance
    // Origin: PRG (member's assigned hub), Destination: BRI (guest's airport)
    const guestReqRes = await request(app)
      .post("/api/listings")
      .set("Authorization", `Bearer ${guestToken}`)
      .send({
        contract_type: "incoming",
        origin_airport: "PRG",
        destination_airport: "BRI",
        aircraft_class: "C",
        is_cargo: false,
        renewal: true,
        duration_hours: 24,
        alliance_id: allianceId,
        visibility: "alliance_only",
        auto_escalate_delay_hours: 12,
        notes: "Guest Turnaround Request: Please send A320 flights to Bari from Prague base",
      });
    assert.strictEqual(guestReqRes.status, 201);
    const guestListingId = guestReqRes.body.listing.id;
    assert.strictEqual(guestReqRes.body.listing.renewal, true);

    // Alliance member queries alliance listings
    const deckListingsRes = await request(app)
      .get(`/api/listings?alliance_id=${allianceId}`)
      .set("Authorization", `Bearer ${memberToken}`);
    assert.strictEqual(deckListingsRes.status, 200);
    const guestItem = deckListingsRes.body.listings.find((l: any) => l.id === guestListingId);
    assert.ok(guestItem, "Alliance member should see guest turnaround request");

    // Member claims the guest request to dispatch planes
    const claimRes = await request(app)
      .post(`/api/listings/${guestListingId}/claim`)
      .set("Authorization", `Bearer ${memberToken}`)
      .send({ notes: "Can dispatch A320 from PRG within 1 hour" });
    assert.strictEqual(claimRes.status, 201);

    // Guest creator approves member's claim
    const approveRes = await request(app)
      .post(`/api/listings/${guestListingId}/approve`)
      .set("Authorization", `Bearer ${guestToken}`)
      .send({});
    assert.strictEqual(approveRes.status, 200);
    assert.strictEqual(approveRes.body.status, "in_progress");

    // Member (flight sender for incoming listing) reports partial dispatch
    const partialRes = await request(app)
      .post(`/api/listings/${guestListingId}/partial-dispatch`)
      .set("Authorization", `Bearer ${memberToken}`)
      .send({});
    assert.strictEqual(partialRes.status, 200);
    assert.strictEqual(partialRes.body.status, "partially_dispatched");
    assert.strictEqual(partialRes.body.event, "partially_dispatched_woa");

    // Verify listing status is now partially_dispatched
    const detailPartial = await request(app)
      .get(`/api/listings/${guestListingId}`)
      .set("Authorization", `Bearer ${memberToken}`);
    assert.strictEqual(detailPartial.body.listing.status, "partially_dispatched");

    // Member confirms full dispatch
    const dispatchRes = await request(app)
      .post(`/api/listings/${guestListingId}/dispatch`)
      .set("Authorization", `Bearer ${memberToken}`)
      .send({});
    assert.strictEqual(dispatchRes.status, 200);

    // Guest recipient confirms turnaround completion
    const completeRes = await request(app)
      .post(`/api/listings/${guestListingId}/accept`)
      .set("Authorization", `Bearer ${guestToken}`)
      .send({});
    assert.strictEqual(completeRes.status, 200);
    assert.strictEqual(completeRes.body.status, "completed");

    // Verify audit log
    const finalDetail = await request(app)
      .get(`/api/listings/${guestListingId}`)
      .set("Authorization", `Bearer ${memberToken}`);
    assert.strictEqual(finalDetail.body.listing.status, "completed");
    const eventTypes = finalDetail.body.events.map((e: any) => e.eventType);
    assert.ok(eventTypes.includes("partially_dispatched_woa"), "Audit log should include partially_dispatched_woa event");
    assert.ok(eventTypes.includes("dispatched_woa"), "Audit log should include dispatched_woa event");
    assert.ok(eventTypes.includes("completed"), "Audit log should include completed event");

    console.log("✓ Alliance guest turnaround workflow passed: Guest posted, member claimed, partial dispatch verified, and bilateral completion confirmed!");
  });
});
