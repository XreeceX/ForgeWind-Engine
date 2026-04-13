export interface UserFeedback {
  id: string;
  userId: string;
  featureId: string;
  rating: number;
  comment: string | null;
  context: Record<string, unknown>;
  createdAt: Date;
}

export interface SentimentBreakdown {
  positive: number;
  neutral: number;
  negative: number;
}

export interface FeedbackAnalysis {
  averageRating: number;
  sentimentBreakdown: SentimentBreakdown;
  topIssues: string[];
  topPraises: string[];
  featureRatings: Record<string, number>;
  suggestions: string[];
}
