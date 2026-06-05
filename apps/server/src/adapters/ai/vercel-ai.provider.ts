import { env } from "../../lib/env";
import { analyseProposalsWithAI } from "./functions/analyse-proposals";
import { analyseProposalWithAI } from "./functions/analyse-proposal";
import { briefWinGuideWithAI } from "./functions/brief-win-guide";
import { checkBriefQualityWithAI } from "./functions/check-brief-quality";
import { embedTextWithAI } from "./functions/embed-text";
import { improveBriefDescriptionWithAI } from "./functions/improve-brief-description";
import type {
  AIProvider,
  AnalysisResult,
  BriefQualityResult,
  BriefWinGuideResult,
  ProposalAnalysisResult,
} from "./ai.provider.interface";
import type {
  Brief,
  CreateBriefDto,
  Proposal,
} from "@eventbid/shared";

export class VercelAIProvider implements AIProvider {
  constructor(
    private readonly generationModel: string,
    private readonly embeddingModel: string,
  ) {}

  analyseProposals(
    brief: Brief,
    proposals: Proposal[],
  ): Promise<AnalysisResult[]> {
    return analyseProposalsWithAI(this.generationModel, brief, proposals);
  }

  analyseProposal(
    brief: Brief,
    proposal: Proposal,
  ): Promise<ProposalAnalysisResult> {
    return analyseProposalWithAI(this.generationModel, brief, proposal);
  }

  briefWinGuide(brief: Brief): Promise<BriefWinGuideResult> {
    return briefWinGuideWithAI(this.generationModel, brief);
  }

  improveBriefDescription(
    description: string,
    requirements: string[],
  ): AsyncIterable<string> {
    return improveBriefDescriptionWithAI(
      this.generationModel,
      description,
      requirements,
    );
  }

  checkBriefQuality(brief: CreateBriefDto): Promise<BriefQualityResult> {
    return checkBriefQualityWithAI(this.generationModel, brief);
  }

  embed(text: string): Promise<number[]> {
    return embedTextWithAI(this.embeddingModel, text);
  }
}

export const ai = new VercelAIProvider(
  env.AI_GENERATION_MODEL,
  env.AI_EMBEDDING_MODEL,
);
