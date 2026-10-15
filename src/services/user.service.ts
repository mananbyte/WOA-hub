import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";

export class UserService {
  static async getProfile(userId: string) {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      const error = new Error("User not found");
      (error as any).statusCode = 404;
      throw error;
    }

    return {
      id: user.id,
      email: user.email,
      discordUsername: user.discordUsername,
      woaPlayerId: user.woaPlayerId,
      reputationScore: user.reputationScore,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static async updateWoaPlayerId(userId: string, woaPlayerId: string) {
    const [updatedUser] = await db
      .update(users)
      .set({
        woaPlayerId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      const error = new Error("User not found");
      (error as any).statusCode = 404;
      throw error;
    }

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      discordUsername: updatedUser.discordUsername,
      woaPlayerId: updatedUser.woaPlayerId,
      reputationScore: updatedUser.reputationScore,
      updatedAt: updatedUser.updatedAt,
    };
  }

  static async getPublicProfile(userId: string) {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      const error = new Error("Player profile not found");
      (error as any).statusCode = 404;
      throw error;
    }

    return {
      id: user.id,
      discordUsername: user.discordUsername,
      woaPlayerId: user.woaPlayerId,
      reputationScore: user.reputationScore,
      createdAt: user.createdAt,
    };
  }
}
