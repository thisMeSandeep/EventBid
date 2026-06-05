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

export interface ProposalAnalysisResult {
  score: number;
  subScores: {
    budgetFit: number;
    inclusionsMatch: number;
    briefAlignment: number;
  };
  summary: string;
  gaps: string[];
}

export interface BriefWinGuideResult {
  summary: string;
  keyRequirements: string[];
  tips: string[];
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
  analyseProposal(
    brief: Brief,
    proposal: Proposal,
  ): Promise<ProposalAnalysisResult>;
  briefWinGuide(brief: Brief): Promise<BriefWinGuideResult>;
  improveBriefDescription(
    description: string,
    requirements: string[],
  ): AsyncIterable<string>;
  checkBriefQuality(brief: CreateBriefDto): Promise<BriefQualityResult>;
  embed(text: string): Promise<number[]>;
}
