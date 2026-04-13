export enum EventCategory {
  PROFILE_VIEW = 'PROFILE_VIEW',
  JOB_SEARCH = 'JOB_SEARCH',
  JOB_APPLICATION = 'JOB_APPLICATION',
  CONTENT_GENERATED = 'CONTENT_GENERATED',
  AGENT_INTERACTION = 'AGENT_INTERACTION',
  LOGIN = 'LOGIN',
  FEATURE_USAGE = 'FEATURE_USAGE',
}

export interface TrackableEvent {
  id: string;
  userId: string;
  eventType: EventCategory;
  action: string;
  metadata: Record<string, unknown>;
  timestamp: Date;
}

export interface EventFilters {
  eventType?: EventCategory;
  startDate?: Date;
  endDate?: Date;
  action?: string;
}

export interface ProfileViews {
  total: number;
  trend: 'up' | 'down' | 'stable';
  weeklyAvg: number;
}

export interface ApplicationMetrics {
  total: number;
  responseRate: number;
  interviewRate: number;
  avgTimeToResponse: number;
}

export interface ContentMetrics {
  postsGenerated: number;
  avgEngagement: number;
  topPerformingTopics: string[];
}

export interface SkillProgress {
  skillsAdded: number;
  assessmentsCompleted: number;
  gapsClosed: number;
}

export interface NetworkGrowth {
  newConnections: number;
  outreachSent: number;
  responseRate: number;
}

export interface DailyActivity {
  date: string;
  actions: number;
  categories: Record<string, number>;
}

export interface UserMetrics {
  profileCompleteness: number;
  profileViews: ProfileViews;
  applicationMetrics: ApplicationMetrics;
  contentMetrics: ContentMetrics;
  skillProgress: SkillProgress;
  networkGrowth: NetworkGrowth;
  overallCareerScore: number;
  weeklyActivity: DailyActivity[];
}
