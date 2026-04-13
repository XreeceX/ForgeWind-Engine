import { z } from 'zod';

export const technicalAnalysisSchema = z.object({
  summary: z.string().min(1),
  architectureNotes: z.array(z.string()).min(1),
  techStack: z.array(z.string()).min(1),
  complexity: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  riskFlags: z.array(z.string()),
});

export const projectUnderstandingSchema = z.object({
  valueProposition: z.string().min(1),
  targetUsers: z.array(z.string()).min(1),
  differentiators: z.array(z.string()).min(1),
  businessReadiness: z.enum(['Low', 'Medium', 'High']),
});

export const careerPositioningSchema = z.object({
  candidateNarrative: z.string().min(1),
  roleFit: z.array(z.string()).min(1),
  interviewTalkingPoints: z.array(z.string()).min(1),
  marketSignals: z.array(z.string()).min(1),
});

export const contentIdeasSchema = z.object({
  postIdeas: z.array(z.string()).min(1),
  articleIdeas: z.array(z.string()).min(1),
  hooks: z.array(z.string()).min(1),
  callToActions: z.array(z.string()).min(1),
});

export const improvementsSchema = z.object({
  codeImprovements: z.array(z.string()).min(1),
  documentationImprovements: z.array(z.string()).min(1),
  portfolioImprovements: z.array(z.string()).min(1),
  priorityOrder: z.array(z.string()).min(1),
});

export const finalContentSchema = z.object({
  finalContent: z.string().min(1),
});
