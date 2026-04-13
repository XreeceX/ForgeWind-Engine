import { z } from 'zod';

export const PersonalInfoSchema = z.object({
  name: z.string().nullable(),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  location: z.string().nullable(),
  linkedinUrl: z.string().url().nullable().or(z.literal('')),
  githubUrl: z.string().url().nullable().or(z.literal('')),
  portfolioUrl: z.string().url().nullable().or(z.literal('')),
});

export const ExperienceSchema = z.object({
  title: z.string(),
  company: z.string(),
  location: z.string().nullable(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  description: z.string().nullable(),
  skills: z.array(z.string()),
});

export const EducationSchema = z.object({
  institution: z.string(),
  degree: z.string().nullable(),
  field: z.string().nullable(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
});

export const ProjectSchema = z.object({
  name: z.string(),
  description: z.string().nullable(),
  technologies: z.array(z.string()),
  url: z.string().url().nullable().or(z.literal('')),
});

export const ParsedResumeSchema = z.object({
  personalInfo: PersonalInfoSchema,
  experiences: z.array(ExperienceSchema),
  education: z.array(EducationSchema),
  skills: z.array(z.string()),
  certifications: z.array(z.string()),
  projects: z.array(ProjectSchema),
});

export type ParsedResume = z.infer<typeof ParsedResumeSchema>;
export type PersonalInfo = z.infer<typeof PersonalInfoSchema>;
export type Experience = z.infer<typeof ExperienceSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type Project = z.infer<typeof ProjectSchema>;
