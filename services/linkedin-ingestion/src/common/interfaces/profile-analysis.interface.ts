export interface SuggestedAction {
  category: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  estimatedImpact: string;
}

export interface SectionScore {
  score: number;
  suggestions: string[];
}

export interface CompletenessScore {
  score: number;
  missingFields: string[];
}

export interface ProfileAnalysis {
  userId: string;
  overallScore: number;
  headlineScore: SectionScore;
  aboutScore: SectionScore;
  experienceScore: SectionScore;
  skillsScore: SectionScore;
  completenessScore: CompletenessScore;
  keyStrengths: string[];
  improvementAreas: string[];
  industryAlignment: string;
  recommendedActions: SuggestedAction[];
  analyzedAt: Date;
}
