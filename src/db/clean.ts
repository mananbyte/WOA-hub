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
import { sql } from "drizzle-orm";

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

export async function runClean() {
  console.log("🧹 Starting database cleanup (purging all stub/demo records)...");

  // 1. Delete dependent tables in order to respect foreign key constraints
  console.log("🗑️  Deleting status events...");
  await db.delete(statusEvents);

  console.log("🗑️  Deleting listing claims...");
  await db.delete(listingClaims);

  console.log("🗑️  Deleting listings (contracts)...");
  await db.delete(listings);

  console.log("🗑️  Deleting alliance assigned airports...");
  await db.delete(allianceAssignedAirports);

  console.log("🗑️  Deleting alliance memberships...");
  await db.delete(allianceMemberships);

  console.log("🗑️  Deleting alliances...");
  await db.delete(alliances);

  console.log("🗑️  Deleting users...");
  await db.delete(users);

  // 2. Ensure all 18 official WoA hubs are present and not deleted
  console.log("📍 Ensuring official World of Airports hubs remain intact...");
  for (const ap of WOA_AIRPORTS) {
    await db
      .insert(airports)
      .values(ap)
      .onConflictDoNothing();
  }

  // 3. Verify counts
  const [statusEventsCount] = await db.select({ count: sql<number>`count(*)` }).from(statusEvents);
  const [listingClaimsCount] = await db.select({ count: sql<number>`count(*)` }).from(listingClaims);
  const [listingsCount] = await db.select({ count: sql<number>`count(*)` }).from(listings);
  const [assignedAirportsCount] = await db.select({ count: sql<number>`count(*)` }).from(allianceAssignedAirports);
  const [membershipsCount] = await db.select({ count: sql<number>`count(*)` }).from(allianceMemberships);
  const [alliancesCount] = await db.select({ count: sql<number>`count(*)` }).from(alliances);
  const [usersCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
  const [airportsCount] = await db.select({ count: sql<number>`count(*)` }).from(airports);

  console.log("\n=======================================================");
  console.log("📊 DATABASE PURGE VERIFICATION REPORT:");
  console.log("=======================================================");
  console.log(`• Status Events:            ${statusEventsCount?.count ?? 0} (Expected: 0)`);
  console.log(`• Listing Claims:           ${listingClaimsCount?.count ?? 0} (Expected: 0)`);
  console.log(`• Listings (Contracts):     ${listingsCount?.count ?? 0} (Expected: 0)`);
  console.log(`• Alliance Assigned Hubs:   ${assignedAirportsCount?.count ?? 0} (Expected: 0)`);
  console.log(`• Alliance Memberships:     ${membershipsCount?.count ?? 0} (Expected: 0)`);
  console.log(`• Alliances:                ${alliancesCount?.count ?? 0} (Expected: 0)`);
  console.log(`• Users:                    ${usersCount?.count ?? 0} (Expected: 0)`);
  console.log(`• Official WoA Hubs:        ${airportsCount?.count ?? 0} (Expected: 18)`);
  console.log("=======================================================");
  console.log("✅ Database successfully cleaned. Platform is ready for real users!\n");
}

runClean()
  .then(() => pool.end())
  .catch((err) => {
    console.error("❌ Cleanup failed:", err);
    process.exit(1);
  });

