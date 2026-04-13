export type RepoComplexity = 'Beginner' | 'Intermediate' | 'Advanced';
export type BranchStrategy =
  | 'beginner-fast-track'
  | 'standard-full-pipeline'
  | 'advanced-thought-leadership';

export interface RepoData {
  id?: string;
  name: string;
  fullName: string;
  description: string;
  readme: string;
  languages: string[];
  stars: number;
  commits: number;
  fileTreeSummary: string;
  keyFiles: string[];
}

export interface TechnicalAnalysis {
  summary: string;
  architectureNotes: string[];
  techStack: string[];
  complexity: RepoComplexity;
  riskFlags: string[];
}

export interface ProjectUnderstanding {
  valueProposition: string;
  targetUsers: string[];
  differentiators: string[];
  businessReadiness: 'Low' | 'Medium' | 'High';
}

export interface CareerPositioning {
  candidateNarrative: string;
  roleFit: string[];
  interviewTalkingPoints: string[];
  marketSignals: string[];
}

export interface ContentIdeas {
  postIdeas: string[];
  articleIdeas: string[];
  hooks: string[];
  callToActions: string[];
}

export interface Improvements {
  codeImprovements: string[];
  documentationImprovements: string[];
  portfolioImprovements: string[];
  priorityOrder: string[];
}

export interface CombinedAnalysis {
  technical: TechnicalAnalysis;
  project: ProjectUnderstanding;
  career: CareerPositioning;
  content: ContentIdeas;
  improvements: Improvements;
}

export interface RepoAnalysisState {
  repoData: RepoData;
  technicalAnalysis?: TechnicalAnalysis;
  projectUnderstanding?: ProjectUnderstanding;
  careerPositioning?: CareerPositioning;
  contentIdeas?: ContentIdeas;
  improvements?: Improvements;
  combinedAnalysis?: CombinedAnalysis;
  finalContent?: string;
  tone?: string;
  audience?: string;
  branchStrategy?: BranchStrategy;
  executionPath?: string[];
  errors: string[];
}
