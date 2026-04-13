export enum JobType {
  FULL_TIME = "FULL_TIME",
  PART_TIME = "PART_TIME",
  CONTRACT = "CONTRACT",
  INTERNSHIP = "INTERNSHIP",
  FREELANCE = "FREELANCE",
}

export enum ExperienceLevel {
  ENTRY = "ENTRY",
  MID = "MID",
  SENIOR = "SENIOR",
  LEAD = "LEAD",
  EXECUTIVE = "EXECUTIVE",
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  skills: string[];
  salaryRange: { min: number; max: number; currency: string } | null;
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  source: string;
  sourceUrl: string;
  postedAt: Date;
  matchScore: number | null;
}
