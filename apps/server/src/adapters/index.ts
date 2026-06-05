import { ai } from "./ai/vercel-ai.provider";
import { email } from "./email/resend.adapter";
import { notifier } from "./notifier/sse.adapter";
import { queue } from "./queue/bullmq.adapter";
import { storage } from "./storage/cloudinary.adapter";

export const adapters = {
  ai,
  email,
  notifier,
  queue,
  storage,
};

export type Adapters = typeof adapters;

export type {
  AIProvider,
  AnalysisResult,
  BriefDescriptionImprovement,
  BriefQualityResult,
  BriefWinGuideResult,
  ProposalAnalysisResult,
} from "./ai/ai.provider.interface";
export { VercelAIProvider } from "./ai/vercel-ai.provider";

export type { EmailAdapter, EmailTemplate } from "./email/email.adapter.interface";
export { ResendEmailAdapter } from "./email/resend.adapter";

export type { NotifierAdapter } from "./notifier/notifier.adapter.interface";
export { SSENotifierAdapter } from "./notifier/sse.adapter";

export type {
  EnqueueOptions,
  JobPayload,
  QueueAdapter,
} from "./queue/queue.adapter.interface";
export { BullMQAdapter } from "./queue/bullmq.adapter";

export type {
  StorageAdapter,
  UploadResult,
} from "./storage/storage.adapter.interface";
export { CloudinaryStorageAdapter } from "./storage/cloudinary.adapter";
