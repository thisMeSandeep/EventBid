import { z } from "zod";

export const createProposalSchema = z.object({
  totalPrice: z.number().int().positive(),
  priceType: z.enum(["fixed", "starting_from"]),
  inclusions: z.array(z.string()).optional(),
  capacityConfirmed: z.boolean().optional(),
  cateringType: z.enum(["included", "external", "addon"]).optional(),
  amenities: z.array(z.string()).optional(),
  availabilityConfirmed: z.boolean().optional(),
  notes: z.string().optional(),
});

export const reviseProposalSchema = createProposalSchema.partial();

export type CreateProposalDto = z.infer<typeof createProposalSchema>;
export type ReviseProposalDto = z.infer<typeof reviseProposalSchema>;
