import { db, pool } from "./index.js";
import { airports } from "./schema.js";

export const WOA_AIRPORTS = [
  { code: "PRG", name: "Václav Havel Airport Prague", region: "Europe" },
  { code: "INN", name: "Innsbruck Airport", region: "Europe" },
  { code: "BRI", name: "Bari Karol Wojtyła Airport", region: "Europe" },
  { code: "SAN", name: "San Diego International Airport", region: "North America" },
  { code: "IAD", name: "Washington Dulles International Airport", region: "North America" },
  { code: "MCT", name: "Muscat International Airport", region: "Middle East" },
  { code: "NGO", name: "Chubu Centrair International Airport", region: "Asia" },
  { code: "LEJ", name: "Leipzig/Halle Airport", region: "Europe" },
  { code: "SXM", name: "Princess Juliana International Airport", region: "Caribbean" },
  { code: "HKG", name: "Hong Kong International Airport", region: "Asia" },
];

export async function seedAirports() {
  console.log("Seeding WoA official airports...");
  for (const airport of WOA_AIRPORTS) {
    await db.insert(airports).values(airport).onConflictDoNothing();
  }
  console.log("Seeding completed successfully.");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedAirports()
    .then(() => pool.end())
    .catch((err) => {
      console.error("Seeding failed:", err);
      process.exit(1);
    });
}
