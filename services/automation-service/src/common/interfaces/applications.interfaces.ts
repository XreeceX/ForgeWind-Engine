export type MatchLevel = 'strong' | 'partial' | 'transferable';

export interface ApplicationPrepParams {
  userId: string;
  jobTitle: string;
  company: string;
  jobDescription: string;
  jobRequirements: string[];
  userSkills: string[];
  userExperience: string;
  userSummary: string;
}

export interface SkillMapping {
  userSkill: string;
  jobRequirement: string;
  matchLevel: MatchLevel;
}

export interface InterviewPrepItem {
  question: string;
  suggestedAnswer: string;
  tips: string;
}

export interface ApplicationChecklistItem {
  item: string;
  completed: boolean;
}

export interface PreparedApplication {
  coverLetter: string;
  skillMapping: SkillMapping[];
  profileTweaks: string[];
  interviewPrep: InterviewPrepItem[];
  applicationChecklist: ApplicationChecklistItem[];
}

export type ApplicationStatusValue =
  | 'saved'
  | 'applied'
  | 'screening'
  | 'interviewing'
  | 'offer'
  | 'rejected'
  | 'withdrawn';

export interface TrackedApplication {
  id: string;
  userId: string;
  jobTitle: string;
  company: string;
  status: ApplicationStatusValue;
  appliedAt: Date;
  lastUpdated: Date;
  notes: string;
}

export interface TrackParams {
  userId: string;
  jobTitle: string;
  company: string;
  status: ApplicationStatusValue;
  notes?: string;
}

export interface ApplicationInsights {
  totalApplications: number;
  statusBreakdown: Record<string, number>;
  averageTimeInPipeline: number;
  topCompanies: string[];
  successRate: number;
  weeklyApplicationRate: number;
  recommendations: string[];
}
