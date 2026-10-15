import { Router, Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service.js";
import { requireAuth } from "../middleware/auth.js";
import { validate, updateWoaIdSchema } from "../middleware/validate.js";

export const userRouter = Router();

userRouter.patch("/me", requireAuth, validate(updateWoaIdSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await UserService.updateWoaPlayerId(req.user!.userId, req.body.woa_player_id);
    res.status(200).json({ user: updated });
  } catch (error) {
    next(error);
  }
});

userRouter.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const profile = await UserService.getPublicProfile(id);
    res.status(200).json({ profile });
  } catch (error) {
    next(error);
  }
});
