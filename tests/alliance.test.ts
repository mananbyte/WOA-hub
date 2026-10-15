import { describe, it } from "node:test";
import assert from "node:assert";
import request from "supertest";
import { app } from "../src/app.js";

describe("Alliance Spaces & RBAC Tests", async () => {
  const timestamp = Date.now();
  const leaderEmail = `leader_${timestamp}@test.com`;
  const pilot2Email = `pilot2_${timestamp}@test.com`;

  let leaderToken: string;
  let leaderUserId: string;
  let pilot2Token: string;
  let pilot2UserId: string;

  let allianceSlug = `skyline-${timestamp}`;
  let secondAllianceSlug = `cargo-global-${timestamp}`;

  it("Setup: Register test users", async () => {
    // Register leader
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

    // Register second pilot
    const res2 = await request(app)
      .post("/api/auth/register")
      .send({
        email: pilot2Email,
        password: "Password123!",
        discord_username: `Pilot2_${timestamp}`,
        woa_player_id: `WOA-P2-${timestamp}`,
        age_confirmed: true,
      });
    assert.strictEqual(res2.status, 201);
    pilot2Token = res2.body.token;
    pilot2UserId = res2.body.user.id;
  });

  it("Test 1: Register an alliance group and verify creator becomes Owner", async () => {
    const res = await request(app)
      .post("/api/alliances")
      .set("Authorization", `Bearer ${leaderToken}`)
      .send({
        name: "Skyline Fleet Alliance",
        slug: allianceSlug,
        description: "Official European hub operations",
        airport_model: "assigned",
        join_policy: "open",
        max_escalation_delay_hours: 6,
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.alliance.slug, allianceSlug);
    assert.strictEqual(res.body.alliance.airportModel, "assigned");

    // Check dossier
    const dossierRes = await request(app)
      .get(`/api/alliances/${allianceSlug}`)
      .set("Authorization", `Bearer ${leaderToken}`);
    assert.strictEqual(dossierRes.status, 200);
    assert.strictEqual(dossierRes.body.alliance.name, "Skyline Fleet Alliance");
    assert.strictEqual(dossierRes.body.activeMembersCount, 1);
    assert.strictEqual(dossierRes.body.userMembership?.role, "owner");
    assert.strictEqual(dossierRes.body.userMembership?.status, "active");
    console.log("✓ Alliance created and creator designated active Owner");
  });

  it("Test 2: Pilot2 joins Skyline Alliance as active member", async () => {
    const res = await request(app)
      .post(`/api/alliances/${allianceSlug}/join`)
      .set("Authorization", `Bearer ${pilot2Token}`)
      .send({});

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.membership.status, "active");
    assert.strictEqual(res.body.membership.role, "member");
    console.log("✓ Pilot2 joined alliance as active member");
  });

  it("Test 3: Enforce single-primary-membership rule (Cannot join or create second alliance as member)", async () => {
    // Leader creates a second alliance with another fresh user
    const resFresh = await request(app)
      .post("/api/auth/register")
      .send({
        email: `cargo_boss_${timestamp}@test.com`,
        password: "Password123!",
        discord_username: `CargoBoss_${timestamp}`,
        age_confirmed: true,
      });
    const cargoBossToken = resFresh.body.token;

    const resAlliance2 = await request(app)
      .post("/api/alliances")
      .set("Authorization", `Bearer ${cargoBossToken}`)
      .send({
        name: "Cargo Global",
        slug: secondAllianceSlug,
        airport_model: "flexible",
        join_policy: "open",
      });
    assert.strictEqual(resAlliance2.status, 201);

    // Pilot2 (already in Skyline) tries to join Cargo Global as Member
    const failJoin = await request(app)
      .post(`/api/alliances/${secondAllianceSlug}/join`)
      .set("Authorization", `Bearer ${pilot2Token}`)
      .send({});

    assert.strictEqual(failJoin.status, 409);
    assert.match(failJoin.body.error, /primary alliance/i);
    console.log("✓ Single primary alliance rule enforced: Pilot2 rejected with 409 Conflict");
  });

  it("Test 4: Multi-guest affiliation (Pilot2 CAN register as Guest of second alliance)", async () => {
    const resGuest = await request(app)
      .post(`/api/alliances/${secondAllianceSlug}/guest`)
      .set("Authorization", `Bearer ${pilot2Token}`);

    assert.strictEqual(resGuest.status, 201);
    assert.strictEqual(resGuest.body.membership.role, "guest");
    assert.strictEqual(resGuest.body.membership.status, "active");
    console.log("✓ Multi-guest affiliation verified: Pilot2 registered as Guest of Cargo Global");
  });

  it("Test 5: Assign operated airports (Max 3 hubs per pilot)", async () => {
    // Assign PRG to Leader
    const res1 = await request(app)
      .post(`/api/alliances/${allianceSlug}/airports`)
      .set("Authorization", `Bearer ${leaderToken}`)
      .send({ airport_code: "PRG" });
    assert.strictEqual(res1.status, 201);
    assert.strictEqual(res1.body.assignment.airportCode, "PRG");

    // Assign INN to Leader
    const res2 = await request(app)
      .post(`/api/alliances/${allianceSlug}/airports`)
      .set("Authorization", `Bearer ${leaderToken}`)
      .send({ airport_code: "INN" });
    assert.strictEqual(res2.status, 201);

    // Assign BRI to Leader (3rd hub)
    const res3 = await request(app)
      .post(`/api/alliances/${allianceSlug}/airports`)
      .set("Authorization", `Bearer ${leaderToken}`)
      .send({ airport_code: "BRI" });
    assert.strictEqual(res3.status, 201);

    // Attempt 4th hub assignment -> must reject with 400 Bad Request
    const res4 = await request(app)
      .post(`/api/alliances/${allianceSlug}/airports`)
      .set("Authorization", `Bearer ${leaderToken}`)
      .send({ airport_code: "SAN" });
    assert.strictEqual(res4.status, 400);
    assert.match(res4.body.error, /max 3/i);
    console.log("✓ Max 3 assigned hubs strictly enforced: 4th hub rejected with 400 Bad Request");
  });

  it("Test 6: Route Matrix calculates coverage across all 10 WoA hubs and flags route gaps", async () => {
    const res = await request(app).get(`/api/alliances/${allianceSlug}/matrix`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.totalOfficialHubs, 10);
    assert.strictEqual(res.body.totalCoveredHubs, 3); // PRG, INN, BRI
    assert.ok(res.body.uncoveredGaps.includes("IAD"));
    assert.ok(res.body.uncoveredGaps.includes("HKG"));

    const prgHub = res.body.matrix.find((m: any) => m.code === "PRG");
    assert.strictEqual(prgHub.status, "covered");
    assert.strictEqual(prgHub.pilots.length, 1);
    assert.strictEqual(prgHub.pilots[0].id, leaderUserId);

    console.log("✓ 10-hub Route Matrix correctly calculated covered hubs and identified route gaps");
  });
});
