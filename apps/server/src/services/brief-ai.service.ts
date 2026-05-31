import type { AIProvider } from "../adapters";
import type { CreateBriefDto } from "@eventbid/shared";

export class BriefAIService {
  constructor(private readonly ai: AIProvider) {}

  checkQuality(brief: CreateBriefDto): Promise<{ warnings: string[] }> {
    return this.ai.checkBriefQuality(brief);
  }

  improveDescription(
    description: string,
    requirements: string[],
  ): AsyncIterable<string> {
    return this.ai.improveBriefDescription(description, requirements);
  }
}
