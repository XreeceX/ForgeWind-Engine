export enum JobType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERNSHIP = 'INTERNSHIP',
  FREELANCE = 'FREELANCE',
}

export enum ExperienceLevel {
  ENTRY = 'ENTRY',
  MID = 'MID',
  SENIOR = 'SENIOR',
  LEAD = 'LEAD',
  EXECUTIVE = 'EXECUTIVE',
}

export enum ApplicationStatus {
  SAVED = 'SAVED',
  APPLIED = 'APPLIED',
  SCREENING = 'SCREENING',
  INTERVIEWING = 'INTERVIEWING',
  OFFER = 'OFFER',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

export interface SalaryRange {
  min: number;
  max: number;
  currency: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  description: string;
  requirements: string[];
  skills: string[];
  salaryRange: SalaryRange | null;
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  source: string;
  sourceUrl: string;
  postedAt: Date;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface JobSearchQuery {
  query: string;
  location?: string;
  jobType?: JobType;
  experienceLevel?: ExperienceLevel;
  remote?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  page: number;
  limit: number;
}

export interface JobFilters {
  jobType?: JobType;
  experienceLevel?: ExperienceLevel;
  location?: string;
  postedAfter?: Date;
}

export interface MarketTrends {
  topSkills: { skill: string; demand: number }[];
  topRoles: string[];
  topCompanies: string[];
  salaryTrends: Record<string, { min: number; max: number; median: number }>;
  emergingTechnologies: string[];
  marketInsights: string[];
}
