import { z } from "zod";

export const createVenueSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  maxCapacity: z.number().int().positive(),
  styleTags: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  eventTypes: z.array(z.string()).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
});

export const updateVenueSchema = createVenueSchema.partial();

export type CreateVenueDto = z.infer<typeof createVenueSchema>;
export type UpdateVenueDto = z.infer<typeof updateVenueSchema>;
