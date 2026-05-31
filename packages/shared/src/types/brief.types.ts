import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type {
  aiAnalyses,
  briefVenueMatches,
  briefs,
  notifications,
} from "@eventbid/server-schema";

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

export type BriefVenueMatch = InferSelectModel<typeof briefVenueMatches>;
export type CreateBriefVenueMatchInput = Omit<
  InferInsertModel<typeof briefVenueMatches>,
  "id" | "createdAt"
>;

export type AiAnalysis = InferSelectModel<typeof aiAnalyses>;
export type CreateAiAnalysisInput = Omit<
  InferInsertModel<typeof aiAnalyses>,
  "id" | "createdAt" | "updatedAt"
>;

export type Notification = InferSelectModel<typeof notifications>;
export type CreateNotificationInput = Omit<
  InferInsertModel<typeof notifications>,
  "id" | "createdAt" | "read"
>;
