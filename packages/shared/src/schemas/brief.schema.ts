import { z } from "zod";

const timeOfDayEnum = z.enum(["morning", "afternoon", "night"]);

export const createBriefSchema = z.object({
  eventType: z.enum(["wedding", "birthday", "party", "other"]),
  eventDateFrom: z.coerce.date(),
  eventDateTo: z.coerce.date(),
  timeOfDay: timeOfDayEnum.optional(),
  headcount: z.number().int().positive(),
  city: z.string().min(1),
  state: z.string().min(1),
  budgetMin: z.number().int().positive(),
  budgetMax: z.number().int().positive(),
  requirements: z.array(z.string()).optional(),
  description: z.string().optional(),
  deadline: z.coerce.date(),
});

export const updateBriefSchema = createBriefSchema.partial();

export type CreateBriefDto = z.infer<typeof createBriefSchema>;
export type UpdateBriefDto = z.infer<typeof updateBriefSchema>;
