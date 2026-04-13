export type SkillRelevance = 'critical' | 'important' | 'nice-to-have';
export type SkillDifficulty = 'easy' | 'moderate' | 'hard';
export type ResourceType = 'course' | 'certification' | 'project' | 'book' | 'tutorial';
export type ResourceCost = 'free' | 'paid';

export interface MatchedSkill {
  skill: string;
  relevance: SkillRelevance;
}

export interface MissingSkill {
  skill: string;
  relevance: SkillRelevance;
  difficulty: SkillDifficulty;
  timeToLearn: string;
}

export interface Resource {
  name: string;
  type: ResourceType;
  provider: string;
  url: string;
  cost: ResourceCost;
  estimatedHours: number;
}

export interface LearningStep {
  skill: string;
  resources: Resource[];
  estimatedTime: string;
  milestone: string;
}

export interface SkillGapAnalysis {
  matchedSkills: MatchedSkill[];
  missingSkills: MissingSkill[];
  overallReadiness: number;
  prioritizedLearningPath: LearningStep[];
}

export interface SkillRecommendation {
  skill: string;
  reasoning: string;
  marketDemand: string;
  relevanceToGoals: string;
  difficulty: SkillDifficulty;
  suggestedResources: Resource[];
}

export interface CertificationRecommendation {
  name: string;
  provider: string;
  cost: string;
  duration: string;
  relevance: string;
  careerImpact: string;
  url: string;
}

export interface ProjectRecommendation {
  title: string;
  description: string;
  skills: string[];
  complexity: SkillDifficulty;
  estimatedTime: string;
  portfolioValue: string;
  learningOutcomes: string[];
}
