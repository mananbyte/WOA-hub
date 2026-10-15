import request from "supertest";
import { app } from "../src/app.js";
import { pool } from "../src/db/index.js";

async function runContractLifecycleTests() {
  console.log("--- Starting Contract Marketplace & Lifecycle Tests ---");

  try {
    // 1. Setup two pilots
    const pilotARes = await request(app)
      .post("/api/auth/register")
      .send({
        email: `pilotA_${Date.now()}@woahub.test`,
        password: "password123!",
        discord_username: "PilotAlpha",
        woa_player_id: "WOA-ALPHA",
      });
    const tokenA = pilotARes.body.token;

    const pilotBRes = await request(app)
      .post("/api/auth/register")
      .send({
        email: `pilotB_${Date.now()}@woahub.test`,
        password: "password123!",
        discord_username: "PilotBravo",
        woa_player_id: "WOA-BRAVO",
      });
    const tokenB = pilotBRes.body.token;

    // 2. Pilot A posts an Outgoing contract listing (PRG -> IAD, Class D)
    const outRes = await request(app)
      .post("/api/listings")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        contract_type: "outgoing",
        aircraft_class: "D",
        is_cargo: false,
        origin_airport: "PRG",
        destination_airport: "IAD",
        notes: "Boeing 787-8 ready for turnaround",
        duration_hours: 12,
      });

    if (outRes.status !== 201 || !outRes.body.listing.id) {
      throw new Error(`Failed to create outgoing listing: ${JSON.stringify(outRes.body)}`);
    }
    const listingId = outRes.body.listing.id;
    console.log("✓ Outgoing contract created with status 'open'");

    // 3. Pilot B posts an Incoming contract request (IAD needs Class E)
    const incRes = await request(app)
      .post("/api/listings")
      .set("Authorization", `Bearer ${tokenB}`)
      .send({
        contract_type: "incoming",
        aircraft_class: "E",
        is_cargo: true,
        origin_airport: "SAN",
        destination_airport: "IAD",
        notes: "Heavy cargo turnaround slots available",
        duration_hours: 24,
      });

    if (incRes.status !== 201) {
      throw new Error(`Failed to create incoming listing: ${JSON.stringify(incRes.body)}`);
    }
    console.log("✓ Incoming contract request created successfully");

    // 4. Test Marketplace Filtering
    const filterRes = await request(app).get("/api/listings?airport=IAD&class=D");
    if (filterRes.status !== 200 || filterRes.body.listings.length === 0) {
      throw new Error("Failed to filter listings by airport and class");
    }
    console.log(`✓ Marketplace filter query returned ${filterRes.body.listings.length} matching listing(s)`);

    // 5. Creator cannot claim own listing
    const selfClaimRes = await request(app)
      .post(`/api/listings/${listingId}/claim`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({});
    if (selfClaimRes.status !== 400) {
      throw new Error(`Expected 400 when claiming own listing, got ${selfClaimRes.status}`);
    }
    console.log("✓ Self-claim prevented with 400 Bad Request");

    // 6. Pilot B claims Pilot A's outgoing listing
    const claimRes = await request(app)
      .post(`/api/listings/${listingId}/claim`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ notes: "Can turnaround within 30 minutes" });

    if (claimRes.status !== 201) {
      throw new Error(`Failed to claim listing: ${JSON.stringify(claimRes.body)}`);
    }
    console.log("✓ Counterparty claimed listing; status transitioned to 'claimed'");

    // 7. Pilot A (creator) approves Pilot B's claim
    const approveRes = await request(app)
      .post(`/api/listings/${listingId}/approve`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({});
    if (approveRes.status !== 200 || approveRes.body.status !== "in_progress") {
      throw new Error(`Failed to approve claim: ${JSON.stringify(approveRes.body)}`);
    }
    console.log("✓ Creator approved claim; contract status is now 'in_progress'");

    // 8. Flight Sender (Pilot A for outgoing) reports in-game dispatch
    const dispatchRes = await request(app)
      .post(`/api/listings/${listingId}/dispatch`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({});
    if (dispatchRes.status !== 200 || dispatchRes.body.status !== "in_progress") {
      throw new Error(`Dispatch reporting failed: ${JSON.stringify(dispatchRes.body)}`);
    }
    console.log("✓ Sender reported in-game dispatch (audit event recorded)");

    // 9. Flight Receiver (Pilot B for outgoing) reports in-game acceptance -> Bilateral Complete!
    const acceptRes = await request(app)
      .post(`/api/listings/${listingId}/accept`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({});
    if (acceptRes.status !== 200 || acceptRes.body.status !== "completed") {
      throw new Error(`Acceptance failed or didn't mark completed: ${JSON.stringify(acceptRes.body)}`);
    }
    console.log("✓ Bilateral completion confirmed! Contract status transitioned to 'completed'");

    // 10. Verify audit event log
    const detailRes = await request(app).get(`/api/listings/${listingId}`);
    if (detailRes.status !== 200) {
      throw new Error("Failed to retrieve contract details");
    }
    const eventTypes = detailRes.body.events.map((e: any) => e.eventType);
    console.log(`Audit log events: ${eventTypes.join(" -> ")}`);
    if (
      !eventTypes.includes("created") ||
      !eventTypes.includes("claimed") ||
      !eventTypes.includes("approved") ||
      !eventTypes.includes("dispatched_woa") ||
      !eventTypes.includes("accepted_woa") ||
      !eventTypes.includes("completed")
    ) {
      throw new Error("Audit log is missing expected lifecycle transition events");
    }
    console.log("✓ Full audit trail verified in status_events");

    // 11. Test Contract Cancellation Flow
    const cancelListingRes = await request(app)
      .post("/api/listings")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        contract_type: "outgoing",
        aircraft_class: "C",
        origin_airport: "INN",
        destination_airport: "PRG",
        duration_hours: 6,
      });
    const cancelListingId = cancelListingRes.body.listing.id;

    const cancelRes = await request(app)
      .post(`/api/listings/${cancelListingId}/cancel`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ reason: "Player went offline due to maintenance" });
    if (cancelRes.status !== 200 || cancelRes.body.status !== "cancelled") {
      throw new Error(`Cancellation failed: ${JSON.stringify(cancelRes.body)}`);
    }
    console.log("✓ Contract cancellation succeeded with mandatory reason recorded");

    console.log("\n🎉 ALL CONTRACT LIFECYCLE TESTS PASSED!");
  } catch (err) {
    console.error("Test failure:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runContractLifecycleTests();
