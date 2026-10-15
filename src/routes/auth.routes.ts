import { Router, Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service.js";
import { validate, registerSchema, loginSchema } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { UserService } from "../services/user.service.js";

export const authRouter = Router();

authRouter.post("/register", validate(registerSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AuthService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

authRouter.post("/login", validate(loginSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AuthService.login(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

authRouter.get("/me", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await UserService.getProfile(req.user!.userId);
    res.status(200).json({ user: profile });
  } catch (error) {
    next(error);
  }
});
