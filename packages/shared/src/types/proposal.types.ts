import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { proposals } from "@eventbid/server-schema";

export type Proposal = InferSelectModel<typeof proposals>;
export type CreateProposalInput = Omit<
  InferInsertModel<typeof proposals>,
  "id" | "createdAt" | "version" | "status"
>;
export type UpdateProposalInput = Partial<
  Omit<
    InferInsertModel<typeof proposals>,
    "id" | "createdAt" | "version" | "status"
  >
>;
export type ProposalStatus = Proposal["status"];
