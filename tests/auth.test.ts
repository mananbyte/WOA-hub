import request from "supertest";
import { app } from "../src/app.js";
import { pool } from "../src/db/index.js";

async function runAuthTests() {
  console.log("--- Starting Authentication & Profile Tests ---");

  try {
    // 1. Register a new user
    const testEmail = `pilot_${Date.now()}@woahub.test`;
    const regRes = await request(app)
      .post("/api/auth/register")
      .send({
        email: testEmail,
        password: "securePassword123!",
        discord_username: "SkyCaptain",
        woa_player_id: "WOA-9921",
      });

    console.log(`Registration status: ${regRes.status}`);
    if (regRes.status !== 201) {
      throw new Error(`Registration failed: ${JSON.stringify(regRes.body)}`);
    }
    if (!regRes.body.token || regRes.body.user.discordUsername !== "SkyCaptain") {
      throw new Error("Invalid registration response structure");
    }
    const token = regRes.body.token;
    const userId = regRes.body.user.id;
    console.log("✓ Registration succeeded with JWT token and Discord handle");

    // 2. Duplicate registration test
    const dupRes = await request(app)
      .post("/api/auth/register")
      .send({
        email: testEmail,
        password: "anotherPassword",
        woa_player_id: "WOA-DUPE-1",
        discord_username: "SkyCaptain2",
      });
    console.log(`Duplicate registration status: ${dupRes.status}`);
    if (dupRes.status !== 409) {
      throw new Error(`Expected 409 Conflict, got ${dupRes.status}`);
    }
    console.log("✓ Duplicate registration rejected with 409 Conflict");

    // 2b. Optional Discord username registration test (succeeds without Discord username)
    const noDiscordEmail = `nodiscord_${Date.now()}@woahub.test`;
    const noDiscordRes = await request(app)
      .post("/api/auth/register")
      .send({
        email: noDiscordEmail,
        password: "securePassword123!",
        woa_player_id: "WOA-NO-DISCORD-101",
      });
    if (noDiscordRes.status !== 201 || noDiscordRes.body.user.discordUsername !== null) {
      throw new Error(`Expected 201 with null discordUsername, got ${noDiscordRes.status}: ${JSON.stringify(noDiscordRes.body)}`);
    }
    console.log("✓ Registration succeeded without optional Discord username (null discordUsername)");

    // 2c. Missing mandatory WoA Player ID test (fails with 400)
    const missingWoaRes = await request(app)
      .post("/api/auth/register")
      .send({
        email: `missingwoa_${Date.now()}@woahub.test`,
        password: "securePassword123!",
        discord_username: "OnlyDiscord",
      });
    if (missingWoaRes.status !== 400) {
      throw new Error(`Expected 400 Bad Request when woa_player_id is missing, got ${missingWoaRes.status}`);
    }
    console.log("✓ Registration rejected with 400 when mandatory woa_player_id is omitted");

    // 3. Login test (success)
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: testEmail,
        password: "securePassword123!",
      });
    console.log(`Login status: ${loginRes.status}`);
    if (loginRes.status !== 200 || !loginRes.body.token) {
      throw new Error(`Login failed: ${JSON.stringify(loginRes.body)}`);
    }
    console.log("✓ Login succeeded with valid JWT");

    // 4. Login test (wrong password)
    const badLoginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: testEmail,
        password: "wrongPassword!",
      });
    if (badLoginRes.status !== 401) {
      throw new Error(`Expected 401 Unauthorized, got ${badLoginRes.status}`);
    }
    console.log("✓ Invalid password correctly rejected with 401");

    // 5. Auth Middleware (missing token)
    const unauthRes = await request(app).get("/api/auth/me");
    if (unauthRes.status !== 401) {
      throw new Error(`Expected 401 without Bearer token, got ${unauthRes.status}`);
    }
    console.log("✓ Unauthenticated request rejected by requireAuth middleware");

    // 6. Auth Middleware (valid token)
    const meRes = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);
    if (meRes.status !== 200 || meRes.body.user.email !== testEmail) {
      throw new Error(`Failed to fetch /api/auth/me: ${JSON.stringify(meRes.body)}`);
    }
    console.log("✓ Authenticated session verified via /api/auth/me");

    // 7. Update WoA In-Game Player ID
    const updateRes = await request(app)
      .patch("/api/users/me")
      .set("Authorization", `Bearer ${token}`)
      .send({ woa_player_id: "WOA-SUPER-777" });
    if (updateRes.status !== 200 || updateRes.body.user.woaPlayerId !== "WOA-SUPER-777") {
      throw new Error(`Failed to update WoA ID: ${JSON.stringify(updateRes.body)}`);
    }
    console.log("✓ WoA Player ID updated successfully on user profile");

    // 8. Public Profile (sanitized, excludes password and email)
    const pubRes = await request(app).get(`/api/users/${userId}`);
    if (pubRes.status !== 200) {
      throw new Error(`Failed to get public profile: ${JSON.stringify(pubRes.body)}`);
    }
    if (pubRes.body.profile.passwordHash || pubRes.body.profile.email) {
      throw new Error("Security leak: public profile exposes password or email!");
    }
    if (pubRes.body.profile.discordUsername !== "SkyCaptain" || pubRes.body.profile.woaPlayerId !== "WOA-SUPER-777") {
      throw new Error("Public profile missing expected public player metadata");
    }
    console.log("✓ Public profile retrieved safely without credentials leak");

    console.log("\n🎉 ALL AUTHENTICATION & PROFILE TESTS PASSED!");
  } catch (error) {
    console.error("Test failure:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runAuthTests();
