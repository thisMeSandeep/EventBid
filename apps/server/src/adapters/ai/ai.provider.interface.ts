import type {
  Brief,
  CreateBriefDto,
  Proposal,
} from "@eventbid/shared";

export interface AnalysisResult {
  proposalId: string;
  score: number;
  summary: string;
  gaps: string[];
}

export interface BriefDescriptionImprovement {
  description: string;
}

export interface BriefQualityResult {
  warnings: string[];
}

export interface AIProvider {
  analyseProposals(
    brief: Brief,
    proposals: Proposal[],
  ): Promise<AnalysisResult[]>;
  improveBriefDescription(
    description: string,
    requirements: string[],
  ): Promise<BriefDescriptionImprovement>;
  checkBriefQuality(brief: CreateBriefDto): Promise<BriefQualityResult>;
  embed(text: string): Promise<number[]>;
}
