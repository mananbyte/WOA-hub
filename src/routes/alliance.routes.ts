import { Router, Request, Response, NextFunction } from "express";
import { AllianceService } from "../services/alliance.service.js";
import { requireAuth } from "../middleware/auth.js";
import { config } from "../config.js";
import { validate } from "../middleware/validate.js";
import {
  createAllianceSchema,
  updateAllianceSchema,
  applyMembershipSchema,
  reviewMembershipSchema,
  assignAirportSchema,
} from "../types/alliance.js";

export const allianceRouter = Router();

// Create new alliance
allianceRouter.post(
  "/",
  requireAuth,
  validate(createAllianceSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const alliance = await AllianceService.createAlliance(req.user!.userId, req.body);
      res.status(201).json({ alliance });
    } catch (error) {
      next(error);
    }
  }
);

// List alliance directory
allianceRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = {
      model: req.query.model as string | undefined,
      search: req.query.search as string | undefined,
    };
    const alliances = await AllianceService.getAlliances(filters);
    res.status(200).json({ alliances });
  } catch (error) {
    next(error);
  }
});

// Get alliance dossier by slug
allianceRouter.get("/:slug", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = req.params.slug as string;
    // Current user id from optional auth token if present
    const authHeader = req.headers.authorization;
    let currentUserId: string | undefined;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const jwt = await import("jsonwebtoken");
        const payload = jwt.default.verify(authHeader.split(" ")[1], config.jwtSecret) as { userId?: string };
        currentUserId = payload.userId;
      } catch {
        // Optional auth
      }
    }
    const data = await AllianceService.getBySlug(slug, currentUserId);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
});

// Update alliance settings (Admin/Owner)
allianceRouter.patch(
  "/:slug",
  requireAuth,
  validate(updateAllianceSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const slug = req.params.slug as string;
      const alliance = await AllianceService.updateAlliance(
        slug,
        req.user!.userId,
        req.body
      );
      res.status(200).json({ alliance });
    } catch (error) {
      next(error);
    }
  }
);

// Join or apply for alliance membership
allianceRouter.post(
  "/:slug/join",
  requireAuth,
  validate(applyMembershipSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const slug = req.params.slug as string;
      const membership = await AllianceService.applyOrJoin(
        slug,
        req.user!.userId,
        req.body.application_note,
        req.body.invite_code
      );
      res.status(201).json({ membership });
    } catch (error) {
      next(error);
    }
  }
);

// Register as Alliance Guest Host (unlimited alliances)
allianceRouter.post(
  "/:slug/guest",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const slug = req.params.slug as string;
      const guest = await AllianceService.registerGuest(slug, req.user!.userId);
      res.status(201).json({ membership: guest });
    } catch (error) {
      next(error);
    }
  }
);

// Admin review application / update role
allianceRouter.patch(
  "/:slug/members/:userId",
  requireAuth,
  validate(reviewMembershipSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const slug = req.params.slug as string;
      const targetUserId = req.params.userId as string;
      const updated = await AllianceService.reviewMembership(
        slug,
        req.user!.userId,
        targetUserId,
        req.body.status,
        req.body.role
      );
      res.status(200).json({ membership: updated });
    } catch (error) {
      next(error);
    }
  }
);

// Get members roster
allianceRouter.get("/:slug/members", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = req.params.slug as string;
    const members = await AllianceService.getMembers(slug);
    res.status(200).json({ members });
  } catch (error) {
    next(error);
  }
});

// Assign airport hub to pilot (max 3)
allianceRouter.post(
  "/:slug/airports",
  requireAuth,
  validate(assignAirportSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const slug = req.params.slug as string;
      const targetUserId = (req.body.user_id as string) || req.user!.userId;
      const assignment = await AllianceService.assignAirport(
        slug,
        req.user!.userId,
        targetUserId,
        req.body.airport_code
      );
      res.status(201).json({ assignment });
    } catch (error) {
      next(error);
    }
  }
);

// Remove assigned airport hub
allianceRouter.delete(
  "/:slug/airports/:code",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const slug = req.params.slug as string;
      const code = req.params.code as string;
      const targetUserId = (req.query.user_id as string) || req.user!.userId;
      const result = await AllianceService.removeAssignedAirport(
        slug,
        req.user!.userId,
        targetUserId,
        code
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

// Get 10-hub Route Matrix and gap analysis
allianceRouter.get("/:slug/matrix", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = req.params.slug as string;
    const matrix = await AllianceService.getRouteMatrix(slug);
    res.status(200).json(matrix);
  } catch (error) {
    next(error);
  }
});
