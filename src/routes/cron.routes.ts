import { Router, Request, Response, NextFunction } from "express";
import { db } from "../db/index.js";
import { listings, listingClaims, statusEvents } from "../db/schema.js";
import { eq, and, lte } from "drizzle-orm";

export const cronRouter = Router();

cronRouter.get("/cleanup", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // If CRON_SECRET is set, protect the endpoint against unauthorized manual triggers
    if (process.env.CRON_SECRET) {
      const authHeader = req.headers.authorization;
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        res.status(401).json({ error: "Unauthorized cron execution" });
        return;
      }
    }

    const now = new Date();

    // 1. Expire listings past expiresAt
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
      await db
        .update(listings)
        .set({ status: "open", updatedAt: now })
        .where(eq(listings.id, claim.listingId));

      await db.insert(statusEvents).values({
        listingId: claim.listingId,
        actorId: null,
        fromStatus: "claimed",
        toStatus: "open",
        eventType: "claim_auto_cancelled",
        notes: "Pending claim timed out after 4 hours without creator approval",
      });
    }

    // 3. Auto-escalate alliance-only listings whose delay has elapsed
    const allianceListings = await db
      .select()
      .from(listings)
      .where(
        and(
          eq(listings.status, "open"),
          eq(listings.visibility, "alliance_only")
        )
      );

    let escalatedCount = 0;
    for (const item of allianceListings) {
      if (item.autoEscalateDelayHours) {
        const threshold = new Date(
          item.createdAt.getTime() + item.autoEscalateDelayHours * 3600 * 1000
        );
        if (now >= threshold) {
          await db
            .update(listings)
            .set({
              visibility: "public",
              escalatedAt: now,
              updatedAt: now,
            })
            .where(eq(listings.id, item.id));

          await db.insert(statusEvents).values({
            listingId: item.id,
            actorId: item.creatorId,
            fromStatus: "open",
            toStatus: "open",
            eventType: "escalated_public",
            notes: "Alliance private contract automatically escalated to the shared marketplace",
          });
          escalatedCount++;
        }
      }
    }

    res.status(200).json({
      status: "ok",
      timestamp: now.toISOString(),
      expiredListings: expired.length,
      cancelledStaleClaims: staleClaims.length,
      escalatedAllianceListings: escalatedCount,
    });
  } catch (error) {
    next(error);
  }
});

