import { z } from "zod";

export const createListingSchema = z.object({
  contract_type: z.enum(["outgoing", "incoming"] as const),
  aircraft_class: z.enum(["A", "B", "C", "D", "E", "F"] as const),
  is_cargo: z.boolean().default(false),
  origin_airport: z.string().min(3).max(4).toUpperCase(),
  destination_airport: z.string().min(3).max(4).toUpperCase(),
  notes: z.string().max(500).optional(),
  duration_hours: z.number().int().min(1).max(72).default(24),
  alliance_id: z.string().uuid().optional(),
  visibility: z.enum(["public", "alliance_only"] as const).default("public"),
  auto_escalate_delay_hours: z.number().int().min(1).max(48).optional(),
});

export const claimListingSchema = z.object({
  notes: z.string().max(500).optional(),
});

export const cancelContractSchema = z.object({
  reason: z.string().min(5, "Cancellation reason must be at least 5 characters long"),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;
export type ClaimListingInput = z.infer<typeof claimListingSchema>;
export type CancelContractInput = z.infer<typeof cancelContractSchema>;
