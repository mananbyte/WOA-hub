import bcrypt from "bcryptjs";
import { db, pool } from "./index.js";
import {
  airports,
  users,
  alliances,
  allianceMemberships,
  allianceAssignedAirports,
  listings,
  listingClaims,
  statusEvents,
} from "./schema.js";
import { eq, inArray } from "drizzle-orm";

/**
 * All 18 Official Playable World of Airports (WoA) Hubs
 */
export const WOA_AIRPORTS = [
  { code: "INN", name: "Innsbruck Airport", region: "Europe" },
  { code: "BRI", name: "Bari-Karol Wojtyła Airport", region: "Europe" },
  { code: "PRG", name: "Václav Havel Airport Prague", region: "Europe" },
  { code: "IAD", name: "Washington Dulles International Airport", region: "North America" },
  { code: "NGO", name: "Chubu Centrair International Airport", region: "Asia" },
  { code: "SAN", name: "San Diego International Airport", region: "North America" },
  { code: "MCT", name: "Muscat International Airport", region: "Middle East" },
  { code: "LEJ", name: "Leipzig-Halle International Airport", region: "Europe" },
  { code: "SXM", name: "Princess Juliana International Airport", region: "Caribbean" },
  { code: "LHR", name: "London Heathrow International Airport", region: "Europe" },
  { code: "SYD", name: "Sydney Kingsford Smith Airport", region: "Oceania" },
  { code: "BKK", name: "Suvarnabhumi Airport", region: "Asia" },
  { code: "MSY", name: "Louis Armstrong New Orleans International Airport", region: "North America" },
  { code: "HKG", name: "Hong Kong International Airport", region: "Asia" },
  { code: "ZRH", name: "Zurich Airport", region: "Europe" },
  { code: "CNN", name: "Kannur International Airport", region: "Asia" },
  { code: "GRU", name: "São Paulo/Guarulhos International Airport", region: "South America" },
  { code: "SCL", name: "Arturo Merino Benítez International Airport", region: "South America" },
];

/**
 * Dedicated Demo Test Users (Password for all: password123)
 */
export const SEED_USERS = [
  {
    email: "captain@woa.hub",
    discordUsername: "CaptainAviation#1001",
    woaPlayerId: "WOA-PRG-8821",
    reputationScore: 98,
    totalCompletedContracts: 42,
    totalCancelledContracts: 1,
  },
  {
    email: "fo_sarah@woa.hub",
    discordUsername: "SarahFlyer#2040",
    woaPlayerId: "WOA-SAN-4512",
    reputationScore: 95,
    totalCompletedContracts: 28,
    totalCancelledContracts: 1,
  },
  {
    email: "cargo_boss@woa.hub",
    discordUsername: "CargoHeavy#3310",
    woaPlayerId: "WOA-LEJ-7719",
    reputationScore: 92,
    totalCompletedContracts: 35,
    totalCancelledContracts: 3,
  },
  {
    email: "host_alex@woa.hub",
    discordUsername: "AlexTurnarounds#4402",
    woaPlayerId: "WOA-MCT-1904",
    reputationScore: 100,
    totalCompletedContracts: 19,
    totalCancelledContracts: 0,
  },
  {
    email: "pacific_kenji@woa.hub",
    discordUsername: "KenjiPacific#5599",
    woaPlayerId: "WOA-NGO-9021",
    reputationScore: 88,
    totalCompletedContracts: 14,
    totalCancelledContracts: 2,
  },
  {
    email: "rookie_dan@woa.hub",
    discordUsername: "DanCadet#6700",
    woaPlayerId: "WOA-SXM-3301",
    reputationScore: 100,
    totalCompletedContracts: 3,
    totalCancelledContracts: 0,
  },
];

export async function runSeed() {
  console.log("✈️ Starting WoA Contract Hub Database Seeder...\n");

  // 1. Seed official World of Airports hubs
  console.log("📍 Seeding 13 Official World of Airports Hubs...");
  for (const ap of WOA_AIRPORTS) {
    await db
      .insert(airports)
      .values(ap)
      .onConflictDoUpdate({
        target: airports.code,
        set: { name: ap.name, region: ap.region },
      });
  }
  console.log(`✓ ${WOA_AIRPORTS.length} playable airports successfully seeded.\n`);

  // 2. Clean up any previous seed records for idempotent runs
  const seedEmails = SEED_USERS.map((u) => u.email);
  const existingSeedUsers = await db
    .select({ id: users.id })
    .from(users)
    .where(inArray(users.email, seedEmails));

  if (existingSeedUsers.length > 0) {
    const userIds = existingSeedUsers.map((u) => u.id);
    console.log(`🧹 Refreshing previous seed data for ${userIds.length} test accounts...`);
    
    // Find listings by these users
    const userListings = await db
      .select({ id: listings.id })
      .from(listings)
      .where(inArray(listings.creatorId, userIds));
    const listingIds = userListings.map((l) => l.id);

    if (listingIds.length > 0) {
      await db.delete(statusEvents).where(inArray(statusEvents.listingId, listingIds));
      await db.delete(listingClaims).where(inArray(listingClaims.listingId, listingIds));
      await db.delete(listings).where(inArray(listings.id, listingIds));
    }

    // Also delete any claims or status events where user was claimant or actor
    await db.delete(statusEvents).where(inArray(statusEvents.actorId, userIds));
    await db.delete(listingClaims).where(inArray(listingClaims.claimantId, userIds));
    await db.delete(allianceAssignedAirports).where(inArray(allianceAssignedAirports.userId, userIds));
    await db.delete(allianceMemberships).where(inArray(allianceMemberships.userId, userIds));
    await db.delete(alliances).where(inArray(alliances.creatorId, userIds));
    await db.delete(users).where(inArray(users.id, userIds));
  }

  // 3. Insert demo test pilots
  console.log("👤 Creating demo test pilots (Password: password123)...");
  const defaultPasswordHash = await bcrypt.hash("password123", 10);
  const userMap = new Map<string, any>();

  for (const u of SEED_USERS) {
    const [created] = await db
      .insert(users)
      .values({
        email: u.email,
        passwordHash: defaultPasswordHash,
        discordUsername: u.discordUsername,
        woaPlayerId: u.woaPlayerId,
        reputationScore: String(u.reputationScore),
        totalCompletedContracts: u.totalCompletedContracts,
        totalCancelledContracts: u.totalCancelledContracts,
      })
      .returning();
    userMap.set(u.email, created);
    console.log(`  • ${u.email} (${u.discordUsername}) - Rep: ${u.reputationScore}%`);
  }

  const captain = userMap.get("captain@woa.hub")!;
  const sarah = userMap.get("fo_sarah@woa.hub")!;
  const cargoBoss = userMap.get("cargo_boss@woa.hub")!;
  const alex = userMap.get("host_alex@woa.hub")!;
  const kenji = userMap.get("pacific_kenji@woa.hub")!;
  const rookieDan = userMap.get("rookie_dan@woa.hub")!;

  // 4. Create Alliances across the 3 operating models
  console.log("\n🏢 Establishing Alliance Consortiums (Assigned, Flexible, Hybrid)...");

  // Alliance 1: Skyline Fleet Consortium (Assigned Hubs Model)
  const [skyline] = await db
    .insert(alliances)
    .values({
      name: "Skyline Fleet Consortium",
      slug: "skyline-fleet",
      description:
        "Premier transatlantic & European hub consortium coordinating scheduled turnaround gates between Prague, Washington Dulles, London Heathrow, and San Diego.",
      airportModel: "assigned",
      joinPolicy: "approval",
      maxEscalationDelayHours: 12,
      discordUrl: "https://discord.gg/skyline-woa",
      creatorId: captain.id,
    })
    .returning();

  // Alliance 2: Cargo Horizon Worldwide (Flexible Routes Model)
  const [cargoHorizon] = await db
    .insert(alliances)
    .values({
      name: "Cargo Horizon Worldwide",
      slug: "cargo-horizon",
      description:
        "Dedicated heavy air freight & cargo alliance operating B747-8F, B777F, and AN-225 freighters across Leipzig, Hong Kong, and Nagoya Centrair.",
      airportModel: "flexible",
      joinPolicy: "open",
      maxEscalationDelayHours: 24,
      discordUrl: "https://discord.gg/cargo-horizon",
      creatorId: cargoBoss.id,
    })
    .returning();

  // Alliance 3: Apex Transpacific Wings (Hybrid System Model)
  const [apexWings] = await db
    .insert(alliances)
    .values({
      name: "Apex Transpacific Wings",
      slug: "apex-wings",
      description:
        "Fast-turnaround Asia-Pacific route corridor linking Chubu Nagoya, Bangkok Suvarnabhumi, and Sydney Kingsford Smith.",
      airportModel: "hybrid",
      joinPolicy: "invite_only",
      maxEscalationDelayHours: 6,
      creatorId: kenji.id,
    })
    .returning();

  console.log(`  • [${skyline.slug}] Skyline Fleet Consortium (Assigned Hubs)`);
  console.log(`  • [${cargoHorizon.slug}] Cargo Horizon Worldwide (Flexible Routes)`);
  console.log(`  • [${apexWings.slug}] Apex Transpacific Wings (Hybrid System)`);

  // 5. Create Alliance Memberships & 4-tier RBAC
  console.log("\n🎖️ Assigning Alliance Roles (Owner, Admin, Member, Guest Host, Pending)...");

  // Skyline memberships:
  // - Captain: Owner
  await db.insert(allianceMemberships).values({
    allianceId: skyline.id,
    userId: captain.id,
    role: "owner",
    status: "active",
  });
  // - Sarah: Admin
  await db.insert(allianceMemberships).values({
    allianceId: skyline.id,
    userId: sarah.id,
    role: "admin",
    status: "active",
  });
  // - Alex: Guest Host (Multi-Alliance affiliation!)
  await db.insert(allianceMemberships).values({
    allianceId: skyline.id,
    userId: alex.id,
    role: "guest",
    status: "active",
  });
  // - Rookie Dan: Pending Applicant (for admin review testing)
  await db.insert(allianceMemberships).values({
    allianceId: skyline.id,
    userId: rookieDan.id,
    role: "member",
    status: "pending",
    applicationNote: "Looking to handle Caribbean feeder turnarounds at SXM!",
  });

  // Cargo Horizon memberships:
  // - Cargo Boss: Owner
  await db.insert(allianceMemberships).values({
    allianceId: cargoHorizon.id,
    userId: cargoBoss.id,
    role: "owner",
    status: "active",
  });
  // - Alex: Full Member
  await db.insert(allianceMemberships).values({
    allianceId: cargoHorizon.id,
    userId: alex.id,
    role: "member",
    status: "active",
  });

  // Apex Wings memberships:
  // - Kenji: Owner
  await db.insert(allianceMemberships).values({
    allianceId: apexWings.id,
    userId: kenji.id,
    role: "owner",
    status: "active",
  });

  console.log("✓ Alliance memberships configured.");

  // 6. Assign Airport Hubs to Pilots (Max 3 hubs per pilot)
  console.log("\n🛫 Assigning Pilot Airport Hubs for Route Matrix...");
  const hubAssignments = [
    // Skyline pilots:
    { allianceId: skyline.id, userId: captain.id, airportCode: "PRG" },
    { allianceId: skyline.id, userId: captain.id, airportCode: "IAD" },
    { allianceId: skyline.id, userId: captain.id, airportCode: "LHR" },
    { allianceId: skyline.id, userId: sarah.id, airportCode: "SAN" },
    { allianceId: skyline.id, userId: sarah.id, airportCode: "INN" },
    { allianceId: skyline.id, userId: alex.id, airportCode: "MCT" },
    { allianceId: skyline.id, userId: alex.id, airportCode: "BRI" },

    // Cargo Horizon pilots:
    { allianceId: cargoHorizon.id, userId: cargoBoss.id, airportCode: "LEJ" },
    { allianceId: cargoHorizon.id, userId: cargoBoss.id, airportCode: "HKG" },
    { allianceId: cargoHorizon.id, userId: cargoBoss.id, airportCode: "NGO" },
    { allianceId: cargoHorizon.id, userId: alex.id, airportCode: "MCT" },

    // Apex Wings pilots:
    { allianceId: apexWings.id, userId: kenji.id, airportCode: "NGO" },
    { allianceId: apexWings.id, userId: kenji.id, airportCode: "BKK" },
    { allianceId: apexWings.id, userId: kenji.id, airportCode: "SYD" },
  ];

  for (const h of hubAssignments) {
    await db.insert(allianceAssignedAirports).values(h);
  }
  console.log("✓ Route matrix hubs assigned across consortiums.");

  // 7. Seed Flight Contracts across all states and scopes
  console.log("\n📦 Seeding Flight Contracts (Open, Internal, Claimed, Dispatched, Completed)...");

  const future24h = new Date(Date.now() + 24 * 3600 * 1000);
  const future12h = new Date(Date.now() + 12 * 3600 * 1000);

  // A. Public Open Contracts
  const [listing1] = await db
    .insert(listings)
    .values({
      creatorId: captain.id,
      contractType: "outgoing",
      aircraftClass: "E",
      isCargo: false,
      renewal: true,
      originAirport: "PRG",
      destinationAirport: "IAD",
      status: "open",
      visibility: "public",
      expiresAt: future24h,
      notes: "Daily transatlantic service on A350. Seeking quick gate turnaround at Dulles.",
    })
    .returning();

  await db.insert(statusEvents).values({
    listingId: listing1.id,
    actorId: captain.id,
    fromStatus: null,
    toStatus: "open",
    eventType: "created",
    notes: "Contract posted to public marketplace",
  });

  const [listing2] = await db
    .insert(listings)
    .values({
      creatorId: sarah.id,
      contractType: "incoming",
      aircraftClass: "C",
      isCargo: false,
      originAirport: "INN",
      destinationAirport: "SAN",
      status: "open",
      visibility: "public",
      expiresAt: future24h,
      notes: "Seeking tourist flight from Alpine hubs into San Diego.",
    })
    .returning();

  await db.insert(statusEvents).values({
    listingId: listing2.id,
    actorId: sarah.id,
    fromStatus: null,
    toStatus: "open",
    eventType: "created",
    notes: "Incoming contract request created",
  });

  const [listing3] = await db
    .insert(listings)
    .values({
      creatorId: cargoBoss.id,
      contractType: "outgoing",
      aircraftClass: "F",
      isCargo: true,
      originAirport: "LEJ",
      destinationAirport: "HKG",
      status: "open",
      visibility: "public",
      expiresAt: future24h,
      notes: "135 metric tons air cargo express between European freight hub and Hong Kong.",
    })
    .returning();

  await db.insert(statusEvents).values({
    listingId: listing3.id,
    actorId: cargoBoss.id,
    fromStatus: null,
    toStatus: "open",
    eventType: "created",
    notes: "Heavy cargo flight scheduled",
  });

  const [listing4] = await db
    .insert(listings)
    .values({
      creatorId: alex.id,
      contractType: "outgoing",
      aircraftClass: "B",
      isCargo: false,
      originAirport: "BRI",
      destinationAirport: "INN",
      status: "open",
      visibility: "public",
      expiresAt: future24h,
      notes: "Alpine commuter flight on ATR-72.",
    })
    .returning();

  await db.insert(statusEvents).values({
    listingId: listing4.id,
    actorId: alex.id,
    fromStatus: null,
    toStatus: "open",
    eventType: "created",
    notes: "Commuter route posted",
  });

  const [listing5] = await db
    .insert(listings)
    .values({
      creatorId: kenji.id,
      contractType: "outgoing",
      aircraftClass: "E",
      isCargo: false,
      originAirport: "BKK",
      destinationAirport: "SYD",
      status: "open",
      visibility: "public",
      expiresAt: future24h,
      notes: "Bangkok to Sydney overnight run.",
    })
    .returning();

  await db.insert(statusEvents).values({
    listingId: listing5.id,
    actorId: kenji.id,
    fromStatus: null,
    toStatus: "open",
    eventType: "created",
    notes: "Long haul flight scheduled",
  });

  // B. Alliance-Only Contracts (Exclusive to Alliance Decks + Partner Priority Hubs!)
  // Skyline Internal: Destination SAN matches Sarah's hub -> Sarah sees PARTNER PRIORITY!
  const [listingSkyline1] = await db
    .insert(listings)
    .values({
      creatorId: captain.id,
      allianceId: skyline.id,
      contractType: "outgoing",
      aircraftClass: "E",
      isCargo: false,
      originAirport: "PRG",
      destinationAirport: "SAN",
      status: "open",
      visibility: "alliance_only",
      autoEscalateDelayHours: 8,
      expiresAt: future24h,
      notes: "Exclusive Skyline fleet run. San Diego station partner needed!",
    })
    .returning();

  await db.insert(statusEvents).values({
    listingId: listingSkyline1.id,
    actorId: captain.id,
    fromStatus: null,
    toStatus: "open",
    eventType: "created",
    notes: "Alliance private contract created with 8h escalation delay",
  });

  // Skyline Internal: Destination PRG matches Captain's hub -> Captain sees PARTNER PRIORITY!
  const [listingSkyline2] = await db
    .insert(listings)
    .values({
      creatorId: sarah.id,
      allianceId: skyline.id,
      contractType: "outgoing",
      aircraftClass: "C",
      isCargo: false,
      originAirport: "INN",
      destinationAirport: "PRG",
      status: "open",
      visibility: "alliance_only",
      autoEscalateDelayHours: 12,
      expiresAt: future24h,
      notes: "Alpine turnaround into Prague base.",
    })
    .returning();

  await db.insert(statusEvents).values({
    listingId: listingSkyline2.id,
    actorId: sarah.id,
    fromStatus: null,
    toStatus: "open",
    eventType: "created",
    notes: "Alliance contract posted with 12h escalation delay",
  });

  // Cargo Horizon Internal: Destination NGO matches Cargo Boss
  const [listingCargo1] = await db
    .insert(listings)
    .values({
      creatorId: cargoBoss.id,
      allianceId: cargoHorizon.id,
      contractType: "outgoing",
      aircraftClass: "F",
      isCargo: true,
      originAirport: "LEJ",
      destinationAirport: "NGO",
      status: "open",
      visibility: "alliance_only",
      autoEscalateDelayHours: 24,
      expiresAt: future24h,
      notes: "AN-225 industrial turbine parts dispatch to Chubu Centrair.",
    })
    .returning();

  await db.insert(statusEvents).values({
    listingId: listingCargo1.id,
    actorId: cargoBoss.id,
    fromStatus: null,
    toStatus: "open",
    eventType: "created",
    notes: "Heavy freighter scheduled in private deck",
  });

  // Guest Turnaround Request: Alex (Guest in Skyline) asks Skyline members for aircraft at Bari (BRI)
  // Alex's airport is BRI. Captain's assigned hub is PRG.
  // Origin: PRG, Destination: BRI. Captain sees ★ MATCHES YOUR ASSIGNED HUB!
  const [guestListing] = await db
    .insert(listings)
    .values({
      creatorId: alex.id,
      allianceId: skyline.id,
      contractType: "incoming",
      aircraftClass: "C",
      isCargo: false,
      renewal: true,
      originAirport: "PRG",
      destinationAirport: "BRI",
      status: "open",
      visibility: "alliance_only",
      expiresAt: future24h,
      notes: "Guest Turnaround Request: Seeking Skyline fleet aircraft at Bari-Karol Wojtyła Airport. Quick ramp handling guaranteed!",
    })
    .returning();

  await db.insert(statusEvents).values({
    listingId: guestListing.id,
    actorId: alex.id,
    fromStatus: null,
    toStatus: "open",
    eventType: "created",
    notes: "Guest fleet contract request submitted to alliance",
  });

  // C. Lifecycle State: CLAIMED (Awaiting Creator Approval)
  // Creator: Captain, Claimant: Sarah. Captain can click "APPROVE CLAIM"!
  const [listingClaimed] = await db
    .insert(listings)
    .values({
      creatorId: captain.id,
      contractType: "outgoing",
      aircraftClass: "D",
      isCargo: false,
      originAirport: "IAD",
      destinationAirport: "LHR",
      status: "claimed",
      visibility: "public",
      expiresAt: future24h,
      notes: "B767-300 transatlantic connection. Ready for partner turnaround approval.",
    })
    .returning();

  await db.insert(statusEvents).values({
    listingId: listingClaimed.id,
    actorId: captain.id,
    fromStatus: null,
    toStatus: "open",
    eventType: "created",
    notes: "Contract created",
  });

  const [claim1] = await db
    .insert(listingClaims)
    .values({
      listingId: listingClaimed.id,
      claimantId: sarah.id,
      status: "pending",
    })
    .returning();

  await db.insert(statusEvents).values({
    listingId: listingClaimed.id,
    actorId: sarah.id,
    fromStatus: "open",
    toStatus: "claimed",
    eventType: "claimed",
    notes: "Sarah claimed the turnaround; awaiting Captain approval",
  });

  // D. Lifecycle State: IN_PROGRESS (Approved, awaiting in-game dispatch)
  // Creator: Sarah, Claimant: Captain. Sarah can click "REPORT DISPATCHED IN WOA"!
  const [listingInProgress] = await db
    .insert(listings)
    .values({
      creatorId: sarah.id,
      contractType: "outgoing",
      aircraftClass: "C",
      isCargo: false,
      originAirport: "SAN",
      destinationAirport: "PRG",
      status: "in_progress",
      visibility: "public",
      expiresAt: future24h,
      notes: "B737 dispatch. Approved and awaiting departure dispatch.",
    })
    .returning();

  await db.insert(listingClaims).values({
    listingId: listingInProgress.id,
    claimantId: captain.id,
    status: "accepted",
  });

  await db.insert(statusEvents).values([
    {
      listingId: listingInProgress.id,
      actorId: sarah.id,
      fromStatus: null,
      toStatus: "open",
      eventType: "created",
      notes: "Contract created",
    },
    {
      listingId: listingInProgress.id,
      actorId: captain.id,
      fromStatus: "open",
      toStatus: "claimed",
      eventType: "claimed",
      notes: "Claimed by Captain",
    },
    {
      listingId: listingInProgress.id,
      actorId: sarah.id,
      fromStatus: "claimed",
      toStatus: "in_progress",
      eventType: "approved",
      notes: "Claim approved by Sarah; awaiting in-game aircraft takeoff",
    },
  ]);

  // E. Lifecycle State: DISPATCHED (Dispatched in WoA, awaiting acceptance)
  // Creator: Cargo Boss, Claimant: Alex. Alex can click "CONFIRM ACCEPTANCE IN WOA"!
  const [listingDispatched] = await db
    .insert(listings)
    .values({
      creatorId: cargoBoss.id,
      contractType: "outgoing",
      aircraftClass: "E",
      isCargo: true,
      originAirport: "HKG",
      destinationAirport: "LEJ",
      status: "dispatched",
      visibility: "public",
      expiresAt: future24h,
      notes: "B777F cargo dispatched in-game. Inbound to Leipzig gates.",
    })
    .returning();

  await db.insert(listingClaims).values({
    listingId: listingDispatched.id,
    claimantId: alex.id,
    status: "accepted",
  });

  await db.insert(statusEvents).values([
    {
      listingId: listingDispatched.id,
      actorId: cargoBoss.id,
      fromStatus: null,
      toStatus: "open",
      eventType: "created",
      notes: "Cargo flight posted",
    },
    {
      listingId: listingDispatched.id,
      actorId: alex.id,
      fromStatus: "open",
      toStatus: "claimed",
      eventType: "claimed",
      notes: "Claimed by Alex",
    },
    {
      listingId: listingDispatched.id,
      actorId: cargoBoss.id,
      fromStatus: "claimed",
      toStatus: "in_progress",
      eventType: "approved",
      notes: "Claim approved",
    },
    {
      listingId: listingDispatched.id,
      actorId: cargoBoss.id,
      fromStatus: "in_progress",
      toStatus: "dispatched",
      eventType: "dispatched_woa",
      notes: "Cargo freighter sent in World of Airports game client",
    },
  ]);

  // F. Lifecycle State: COMPLETED (Bilateral confirmation completed)
  const [listingCompleted] = await db
    .insert(listings)
    .values({
      creatorId: captain.id,
      contractType: "outgoing",
      aircraftClass: "C",
      isCargo: false,
      originAirport: "PRG",
      destinationAirport: "BRI",
      status: "completed",
      visibility: "public",
      expiresAt: future24h,
      notes: "European connection. Completed turnaround.",
    })
    .returning();

  await db.insert(listingClaims).values({
    listingId: listingCompleted.id,
    claimantId: alex.id,
    status: "accepted",
  });

  await db.insert(statusEvents).values([
    {
      listingId: listingCompleted.id,
      actorId: captain.id,
      fromStatus: null,
      toStatus: "open",
      eventType: "created",
      notes: "Flight scheduled",
    },
    {
      listingId: listingCompleted.id,
      actorId: alex.id,
      fromStatus: "open",
      toStatus: "claimed",
      eventType: "claimed",
      notes: "Claimed by Alex",
    },
    {
      listingId: listingCompleted.id,
      actorId: captain.id,
      fromStatus: "claimed",
      toStatus: "in_progress",
      eventType: "approved",
      notes: "Approved",
    },
    {
      listingId: listingCompleted.id,
      actorId: captain.id,
      fromStatus: "in_progress",
      toStatus: "dispatched",
      eventType: "dispatched_woa",
      notes: "Sent in World of Airports",
    },
    {
      listingId: listingCompleted.id,
      actorId: alex.id,
      fromStatus: "dispatched",
      toStatus: "completed",
      eventType: "accepted_woa",
      notes: "Accepted at Bari gates; turnaround completed bilateral handshake",
    },
  ]);

  // G. Lifecycle State: CANCELLED
  const [listingCancelled] = await db
    .insert(listings)
    .values({
      creatorId: alex.id,
      contractType: "outgoing",
      aircraftClass: "B",
      isCargo: false,
      originAirport: "BRI",
      destinationAirport: "MCT",
      status: "cancelled",
      visibility: "public",
      expiresAt: future12h,
      notes: "Regional flight cancelled due to severe Mediterranean storm warning.",
    })
    .returning();

  await db.insert(statusEvents).values([
    {
      listingId: listingCancelled.id,
      actorId: alex.id,
      fromStatus: null,
      toStatus: "open",
      eventType: "created",
      notes: "Contract created",
    },
    {
      listingId: listingCancelled.id,
      actorId: alex.id,
      fromStatus: "open",
      toStatus: "cancelled",
      eventType: "cancelled",
      notes: "Cancelled by pilot: Severe Mediterranean storm warning",
    },
  ]);

  console.log("✓ 14 realistic flight contracts seeded across all states.\n");

  console.log("=================================================================");
  console.log("🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!");
  console.log("=================================================================");
  console.log("Use any of these demo accounts to log in (Password: password123):\n");
  console.log("1. captain@woa.hub      | Skyline Alliance Owner   | PRG, IAD, LHR");
  console.log("2. fo_sarah@woa.hub     | Skyline Alliance Admin   | SAN, INN");
  console.log("3. cargo_boss@woa.hub   | Cargo Horizon Owner      | LEJ, HKG, NGO");
  console.log("4. host_alex@woa.hub    | Skyline Guest & Cargo Mbr| MCT, BRI");
  console.log("5. pacific_kenji@woa.hub| Apex Wings Owner         | NGO, BKK, SYD");
  console.log("6. rookie_dan@woa.hub   | Skyline Pending Review   | SXM");
  console.log("=================================================================\n");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runSeed()
    .then(() => pool.end())
    .catch((err) => {
      console.error("❌ Seeding failed:", err);
      process.exit(1);
    });
}
