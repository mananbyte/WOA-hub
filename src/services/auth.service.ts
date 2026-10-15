import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { generateToken } from "../middleware/auth.js";

export interface RegisterInput {
  email: string;
  password: string;
  discord_username: string;
  woa_player_id?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  static async register(input: RegisterInput) {
    const existing = await db.select().from(users).where(eq(users.email, input.email.toLowerCase()));
    if (existing.length > 0) {
      const error = new Error("A user with this email already exists");
      (error as any).statusCode = 409;
      throw error;
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(input.password, saltRounds);

    const [newUser] = await db
      .insert(users)
      .values({
        email: input.email.toLowerCase(),
        passwordHash,
        discordUsername: input.discord_username,
        woaPlayerId: input.woa_player_id || null,
      })
      .returning();

    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      discordUsername: newUser.discordUsername,
    });

    return {
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        discordUsername: newUser.discordUsername,
        woaPlayerId: newUser.woaPlayerId,
        reputationScore: newUser.reputationScore,
        createdAt: newUser.createdAt,
      },
    };
  }

  static async login(input: LoginInput) {
    const [user] = await db.select().from(users).where(eq(users.email, input.email.toLowerCase()));
    if (!user) {
      const error = new Error("Invalid email or password");
      (error as any).statusCode = 401;
      throw error;
    }

    const isValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValid) {
      const error = new Error("Invalid email or password");
      (error as any).statusCode = 401;
      throw error;
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      discordUsername: user.discordUsername,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        discordUsername: user.discordUsername,
        woaPlayerId: user.woaPlayerId,
        reputationScore: user.reputationScore,
        createdAt: user.createdAt,
      },
    };
  }
}
