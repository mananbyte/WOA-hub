import request from "supertest";
import { app } from "../src/app.js";
import { pool } from "../src/db/index.js";

async function runConcurrencyStressTest() {
  console.log("--- Starting Concurrency & Claim Race Condition Test ---");

  try {
    // 1. Create a host pilot and two competing claimant pilots
    const hostRes = await request(app)
      .post("/api/auth/register")
      .send({
        email: `host_${Date.now()}@woahub.test`,
        password: "password123!",
        discord_username: "HostPilot",
      });
    const hostToken = hostRes.body.token;

    const claimant1Res = await request(app)
      .post("/api/auth/register")
      .send({
        email: `claimant1_${Date.now()}@woahub.test`,
        password: "password123!",
        discord_username: "Claimant1",
      });
    const token1 = claimant1Res.body.token;

    const claimant2Res = await request(app)
      .post("/api/auth/register")
      .send({
        email: `claimant2_${Date.now()}@woahub.test`,
        password: "password123!",
        discord_username: "Claimant2",
      });
    const token2 = claimant2Res.body.token;

    // 2. Host posts a high-demand flight contract (HKG -> PRG, Class F)
    const listRes = await request(app)
      .post("/api/listings")
      .set("Authorization", `Bearer ${hostToken}`)
      .send({
        contract_type: "outgoing",
        aircraft_class: "F",
        origin_airport: "HKG",
        destination_airport: "PRG",
        notes: "Airbus A380-800 rare livery connection",
        duration_hours: 24,
      });
    const listingId = listRes.body.listing.id;
    console.log(`Open contract listing created: ${listingId}`);

    // 3. Fire simultaneous concurrent claims at the EXACT same millisecond
    console.log("Dispatching simultaneous concurrent claims...");
    const [req1, req2] = await Promise.all([
      request(app)
        .post(`/api/listings/${listingId}/claim`)
        .set("Authorization", `Bearer ${token1}`)
        .send({ notes: "Claim from user 1" }),
      request(app)
        .post(`/api/listings/${listingId}/claim`)
        .set("Authorization", `Bearer ${token2}`)
        .send({ notes: "Claim from user 2" }),
    ]);

    const statuses = [req1.status, req2.status].sort();
    console.log(`Received concurrent responses: ${statuses[0]} and ${statuses[1]}`);

    // Exactly one must succeed (201) and one must be rejected with 409 Conflict
    if (statuses[0] !== 201 || statuses[1] !== 409) {
      throw new Error(
        `Concurrency failure! Expected [201, 409], but got [${statuses[0]}, ${statuses[1]}]. Response 1: ${JSON.stringify(req1.body)}, Response 2: ${JSON.stringify(req2.body)}`
      );
    }

    console.log("✓ Concurrency row-level locking strictly protected listing: Exactly 1 claim succeeded (201), 1 claim rejected with 409 Conflict!");

    console.log("\n🎉 CONCURRENCY STRESS TEST PASSED!");
  } catch (err) {
    console.error("Concurrency test failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runConcurrencyStressTest();
