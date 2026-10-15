import { PgBoss } from "pg-boss";
import { db } from "../db/index.js";
import { listings, listingClaims, statusEvents } from "../db/schema.js";
import { eq, and, sql, lte } from "drizzle-orm";

const connectionString =
  process.env.DATABASE_URL || "postgresql://postgres:postgrespassword@localhost:5432/woa_hub";

export const boss = new PgBoss({
  connectionString,
  schema: "pgboss",
});

export let isWorkerRunning = false;

boss.on("error", (err) => {
  console.error("pg-boss worker error:", err);
});

export async function startWorkers() {
  await boss.start();
  isWorkerRunning = true;
  console.log("pg-boss background worker service started.");

  // Ensure queues exist in pg-boss v12 before starting workers
  try {
    await boss.createQueue("escalate-alliance-listing");
  } catch {}
  try {
    await boss.createQueue("cleanup-stale-listings");
  } catch {}

  // Handler: Delayed private listing escalation to public board
  await boss.work("escalate-alliance-listing", async ([job]) => {
    const { listingId } = job.data as { listingId: string };
    console.log(`Processing auto-escalation for listing ${listingId}`);

    const [listing] = await db
      .select()
      .from(listings)
      .where(eq(listings.id, listingId));

    if (listing && listing.status === "open" && listing.visibility === "alliance_only") {
      await db
        .update(listings)
        .set({
          visibility: "public",
          escalatedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(listings.id, listingId));

      await db.insert(statusEvents).values({
        listingId,
        actorId: listing.creatorId,
        fromStatus: "open",
        toStatus: "open",
        eventType: "escalated_public",
        notes: "Alliance private contract automatically escalated to the shared marketplace",
      });

      console.log(`Listing ${listingId} successfully escalated to public marketplace.`);
    }
  });

  // Handler: Periodic cleanup of expired listings and unapproved claims
  await boss.work("cleanup-stale-listings", async () => {
    const now = new Date();

    // 1. Expire stale listings older than expiresAt
    const expired = await db
      .update(listings)
      .set({ status: "expired", updatedAt: now })
      .where(and(eq(listings.status, "open"), lte(listings.expiresAt, now)))
      .returning({ id: listings.id, creatorId: listings.creatorId });

    for (const exp of expired) {
      await db.insert(statusEvents).values({
        listingId: exp.id,
        actorId: exp.creatorId,
        fromStatus: "open",
        toStatus: "expired",
        eventType: "auto_expired",
        notes: "Listing expired due to operational window timeout",
      });
    }

    // 2. Cancel claims unapproved after 4 hours (STAT-08)
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
    const staleClaims = await db
      .update(listingClaims)
      .set({ status: "cancelled", updatedAt: now })
      .where(and(eq(listingClaims.status, "pending"), lte(listingClaims.createdAt, fourHoursAgo)))
      .returning({ id: listingClaims.id, listingId: listingClaims.listingId });

    for (const claim of staleClaims) {
      // Revert listing back to open if no other claims
      await db
        .update(listings)
        .set({ status: "open", updatedAt: now })
        .where(eq(listings.id, claim.listingId));
    }
  });

  // Schedule cron job to run every 15 minutes
  await boss.schedule("cleanup-stale-listings", "*/15 * * * *", {});
}

export async function stopWorkers() {
  await boss.stop();
  isWorkerRunning = false;
  console.log("pg-boss background worker service stopped.");
}
