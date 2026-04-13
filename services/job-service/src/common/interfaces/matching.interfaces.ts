import { Job } from './job.interfaces';

export interface CareerGoals {
  targetRole: string | null;
  targetIndustry: string[] | null;
  targetCompanies: string[] | null;
  salaryRange: { min: number; max: number; currency: string } | null;
  willingToRelocate: boolean;
  remotePreference: RemotePreference;
}

export enum RemotePreference {
  REMOTE = 'REMOTE',
  HYBRID = 'HYBRID',
  ONSITE = 'ONSITE',
  ANY = 'ANY',
}

export interface UserPreferences {
  preferredLocations: string[];
  remotePreference: RemotePreference;
  preferredCompanySize: CompanySize[];
  preferredIndustries: string[];
  minimumSalary: number | null;
  willingToRelocate: boolean;
}

export enum CompanySize {
  STARTUP = 'STARTUP',
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE',
  ENTERPRISE = 'ENTERPRISE',
}

export interface UserProfile {
  id: string;
  skills: string[];
  experience: string[];
  education: string[];
  careerGoals: CareerGoals;
  preferences: UserPreferences;
}

export interface MatchResult {
  overallScore: number;
  skillMatch: number;
  experienceMatch: number;
  locationMatch: number;
  salaryMatch: number;
  cultureFit: number;
  breakdown: { category: string; score: number; reason: string }[];
  pros: string[];
  cons: string[];
}

export interface MatchedJob extends Job {
  matchResult: MatchResult;
}

export interface MatchExplanation {
  summary: string;
  strengths: string[];
  gaps: string[];
  preparationTips: string[];
}
