import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  discord_username: z
    .string()
    .min(2, "Discord username must be at least 2 characters")
    .max(32, "Discord username cannot exceed 32 characters")
    .regex(/^[^@#:]{2,32}$/, "Invalid Discord username format"),
  woa_player_id: z.string().max(100).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const updateWoaIdSchema = z.object({
  woa_player_id: z.string().min(1, "WoA Player ID is required").max(100),
});

export function validate(schema: z.ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: "Validation failed",
          details: error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
        return;
      }
      res.status(400).json({ error: "Invalid request payload" });
    }
  };
}
