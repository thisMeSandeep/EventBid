import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { briefs } from "@eventbid/server-schema";

export type Brief = InferSelectModel<typeof briefs>;
export type CreateBriefInput = Omit<
  InferInsertModel<typeof briefs>,
  "id" | "createdAt" | "updatedAt"
>;
export type UpdateBriefInput = Partial<
  Omit<
    InferInsertModel<typeof briefs>,
    "id" | "hostId" | "createdAt" | "updatedAt"
  >
>;
export type BriefStatus = Brief["status"];
