export interface NetworkAnalysis {
  totalConnections: number;
  industryBreakdown: Record<string, number>;
  seniorityBreakdown: Record<string, number>;
  recentActivity: string;
  strongTies: number;
  weakTies: number;
}

export interface ConnectionRecommendation {
  targetRole: string;
  targetIndustry: string;
  reason: string;
  approachStrategy: string;
  messageTemplate: string;
  priority: 'high' | 'medium' | 'low';
}

export interface NetworkingStrategy {
  weeklyGoals: string[];
  targetAudiences: string[];
  engagementTactics: string[];
  events: string[];
  communities: string[];
}
