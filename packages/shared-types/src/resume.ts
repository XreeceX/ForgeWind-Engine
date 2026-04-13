import type { Education, Experience } from "./profile.js";

export interface PersonalInfo {
  name: string;
  email: string;
  phone: string | null;
  location: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  portfolioUrl: string | null;
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  url: string | null;
}

export interface ParsedResume {
  personalInfo: PersonalInfo;
  experiences: Experience[];
  education: Education[];
  skills: string[];
  certifications: string[];
  projects: Project[];
  rawText: string;
}
