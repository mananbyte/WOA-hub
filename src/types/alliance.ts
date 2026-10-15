import { z } from "zod";

export const createAllianceSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(50, "Name must be at most 50 characters"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(50, "Slug must be at most 50 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase alphanumeric characters and hyphens"),
  description: z.string().max(1000).optional(),
  logo_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  discord_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  airport_model: z.enum(["assigned", "flexible", "hybrid"]).default("flexible"),
  join_policy: z.enum(["open", "approval", "invite_only"]).default("approval"),
  max_escalation_delay_hours: z.number().int().min(2).max(48).default(24),
});

export const updateAllianceSchema = z.object({
  name: z.string().min(3).max(50).optional(),
  description: z.string().max(1000).optional(),
  logo_url: z.string().url().optional().or(z.literal("")),
  discord_url: z.string().url().optional().or(z.literal("")),
  airport_model: z.enum(["assigned", "flexible", "hybrid"]).optional(),
  join_policy: z.enum(["open", "approval", "invite_only"]).optional(),
  max_escalation_delay_hours: z.number().int().min(2).max(48).optional(),
});

export const applyMembershipSchema = z.object({
  application_note: z.string().max(500).optional(),
  invite_code: z.string().optional(),
});

export const reviewMembershipSchema = z.object({
  status: z.enum(["active", "rejected"]),
  role: z.enum(["admin", "member", "guest"]).optional(),
});

export const assignAirportSchema = z.object({
  airport_code: z.string().min(3).max(4).transform((v) => v.toUpperCase()),
});

export type CreateAllianceInput = z.infer<typeof createAllianceSchema>;
export type UpdateAllianceInput = z.infer<typeof updateAllianceSchema>;
export type ApplyMembershipInput = z.infer<typeof applyMembershipSchema>;
export type ReviewMembershipInput = z.infer<typeof reviewMembershipSchema>;
export type AssignAirportInput = z.infer<typeof assignAirportSchema>;
