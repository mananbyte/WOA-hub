import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config.js";

export interface AuthUser {
  userId: string;
  email: string;
  woaPlayerId: string;
  discordUsername?: string | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid authorization header" });
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, config.jwtSecret) as AuthUser;
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const payload = jwt.verify(token, config.jwtSecret) as AuthUser;
      req.user = payload;
    } catch {
      // Ignore invalid or expired token for optional auth
    }
  }
  next();
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      userId: user.userId,
      email: user.email,
      woaPlayerId: user.woaPlayerId,
      discordUsername: user.discordUsername || null,
    },
    config.jwtSecret,
    { expiresIn: "7d" }
  );
}
