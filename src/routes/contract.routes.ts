import { Router, Request, Response, NextFunction } from "express";
import { ContractService } from "../services/contract.service.js";
import { requireAuth, optionalAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  createListingSchema,
  claimListingSchema,
  cancelContractSchema,
} from "../types/contract.js";

export const contractRouter = Router();

// Create listing (Outgoing or Incoming)
contractRouter.post(
  "/",
  requireAuth,
  validate(createListingSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const listing = await ContractService.createListing(req.user!.userId, req.body);
      res.status(201).json({ listing });
    } catch (error) {
      next(error);
    }
  }
);

// Get listings with filters
contractRouter.get("/", optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = {
      airport: req.query.airport as string | undefined,
      aircraftClass: req.query.class as string | undefined,
      contractType: req.query.type as string | undefined,
      isCargo: req.query.cargo !== undefined ? req.query.cargo === "true" : undefined,
      status: req.query.status as string | undefined,
      allianceId: req.query.alliance_id as string | undefined,
      currentUserId: req.user?.userId,
    };
    const listings = await ContractService.getListings(filters);
    res.status(200).json({ listings });
  } catch (error) {
    next(error);
  }
});

// Get listing details with claims and audit events
contractRouter.get("/:id", optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const details = await ContractService.getListingById(id, req.user?.userId);
    res.status(200).json(details);
  } catch (error) {
    next(error);
  }
});

// Claim listing (concurrency-safe with row locking)
contractRouter.post(
  "/:id/claim",
  requireAuth,
  validate(claimListingSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const claim = await ContractService.claimListing(id, req.user!.userId);
      res.status(201).json({ claim });
    } catch (error) {
      next(error);
    }
  }
);

// Creator approves claim
contractRouter.post("/:id/approve", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const result = await ContractService.approveClaim(id, req.user!.userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// Flight sender reports partial dispatch in WoA
contractRouter.post("/:id/partial-dispatch", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const result = await ContractService.reportPartialDispatch(id, req.user!.userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// Flight sender reports dispatch in WoA
contractRouter.post("/:id/dispatch", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const result = await ContractService.reportDispatched(id, req.user!.userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// Flight receiver reports acceptance in WoA
contractRouter.post("/:id/accept", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const result = await ContractService.reportAccepted(id, req.user!.userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// Cancel contract with mandatory reason
contractRouter.post(
  "/:id/cancel",
  requireAuth,
  validate(cancelContractSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const result = await ContractService.cancelContract(id, req.user!.userId, req.body.reason);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);
