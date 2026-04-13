export type PostTone =
  | 'professional'
  | 'casual'
  | 'thought-leadership'
  | 'storytelling';

export type PostLength = 'short' | 'medium' | 'long';

export interface UserContext {
  industry: string;
  role: string;
  expertise: string[];
}

export interface PostGenerationParams {
  topic: string;
  tone: PostTone;
  length: PostLength;
  includeHashtags: boolean;
  includeEmoji: boolean;
  userContext: UserContext;
}

export interface GeneratedContent {
  content: string;
  hashtags: string[];
  estimatedEngagement: string;
  variations: string[];
}

export interface HeadlineParams {
  currentHeadline: string;
  role: string;
  industry: string;
  skills: string[];
  valueProposition: string;
}

export interface HeadlineOption {
  headline: string;
  reasoning: string;
}

export interface GeneratedHeadlines {
  options: HeadlineOption[];
}

export interface AboutParams {
  currentAbout: string;
  role: string;
  industry: string;
  experience: string[];
  skills: string[];
  achievements: string[];
  targetAudience: string;
}

export interface GeneratedAbout {
  aboutSection: string;
  keywordHighlights: string[];
  characterCount: number;
}

export interface ExperienceRewriteParams {
  jobTitle: string;
  company: string;
  originalBullets: string[];
  industry: string;
  targetRole: string;
}

export interface RewrittenBullet {
  original: string;
  rewritten: string;
  improvements: string[];
}

export interface RewrittenExperience {
  bullets: RewrittenBullet[];
  summary: string;
}

export interface ColdEmailParams {
  senderName: string;
  senderRole: string;
  recipientName: string;
  recipientRole: string;
  recipientCompany: string;
  purpose: string;
  commonGround: string[];
  tone: 'formal' | 'friendly' | 'bold';
}

export interface GeneratedEmail {
  subject: string;
  body: string;
  callToAction: string;
  followUpSuggestion: string;
}

export interface RewriteParams {
  originalText: string;
  targetTone: string;
  purpose: string;
}

export interface RewrittenText {
  rewrittenText: string;
  changes: string[];
}
