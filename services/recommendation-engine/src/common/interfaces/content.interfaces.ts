export interface TopicRecommendation {
  topic: string;
  reasoning: string;
  contentFormat: string;
  targetAudience: string;
  estimatedEngagement: string;
  relatedKeywords: string[];
}

export interface PersonRecommendation {
  name: string;
  headline: string;
  reason: string;
  commonInterests: string[];
  engagementTip: string;
}

export interface CompanyRecommendation {
  name: string;
  industry: string;
  size: string;
  whyGoodFit: string;
  openRoles: string[];
  culture: string;
  growthTrajectory: string;
  connectionStrategy: string;
}
