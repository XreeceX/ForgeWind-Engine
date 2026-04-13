export type ContentType =
  | 'text'
  | 'image'
  | 'carousel'
  | 'article'
  | 'poll';

export interface CalendarParams {
  industry: string;
  role: string;
  expertise: string[];
  goals: string[];
  weeksCount: number;
  postsPerWeek: number;
}

export interface PlannedPost {
  dayOfWeek: string;
  topic: string;
  contentType: ContentType;
  hook: string;
  keyPoints: string[];
  callToAction: string;
  estimatedEngagement: string;
}

export interface WeekPlan {
  weekNumber: number;
  posts: PlannedPost[];
}

export interface ContentCalendar {
  weeks: WeekPlan[];
  overallTheme: string;
  goals: string[];
}

export interface PostPerformance {
  content: string;
  contentType: ContentType;
  likes: number;
  comments: number;
  shares: number;
  impressions: number;
  postedAt: string;
  topic: string;
}

export interface ContentInsights {
  topPerformingTopics: string[];
  bestContentTypes: string[];
  bestPostingTimes: string[];
  averageEngagementRate: number;
  recommendations: string[];
  trendAnalysis: string;
}

export interface TopicSuggestionParams {
  industry: string;
  expertise: string[];
  recentTopics: string[];
  targetAudience: string;
}

export interface SuggestedTopic {
  topic: string;
  reasoning: string;
  contentType: ContentType;
  angle: string;
  estimatedRelevance: string;
}

export interface TopicSuggestions {
  topics: SuggestedTopic[];
  trendingInIndustry: string[];
}
