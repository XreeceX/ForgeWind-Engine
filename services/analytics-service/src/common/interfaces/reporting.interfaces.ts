import { UserMetrics } from './tracking.interfaces';

export interface MetricComparison {
  metric: string;
  current: number;
  previous: number;
  change: number;
}

export interface WeeklyReport {
  period: { start: string; end: string };
  highlights: string[];
  metrics: UserMetrics;
  achievements: string[];
  recommendations: string[];
  nextWeekGoals: string[];
  comparisons: MetricComparison[];
}

export interface Milestone {
  title: string;
  achievedAt: string;
  impact: string;
}

export interface ApplicationsOverview {
  total: number;
  successRate: number;
  topCompanies: string[];
}

export interface NetworkGrowthOverview {
  start: number;
  current: number;
  keyConnections: string[];
}

export interface ContentImpact {
  totalPosts: number;
  totalEngagement: number;
  averageReach: number;
}

export interface CareerProgressReport {
  overallProgress: number;
  milestones: Milestone[];
  skillsGained: string[];
  applicationsOverview: ApplicationsOverview;
  networkGrowth: NetworkGrowthOverview;
  contentImpact: ContentImpact;
  areasOfImprovement: string[];
  nextSteps: string[];
}
