export enum SkillProficiency {
  BEGINNER = "BEGINNER",
  INTERMEDIATE = "INTERMEDIATE",
  ADVANCED = "ADVANCED",
  EXPERT = "EXPERT",
}

export interface Experience {
  title: string;
  company: string;
  location: string;
  startDate: Date;
  endDate: Date | null;
  description: string;
  skills: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: Date;
  endDate: Date;
}

export interface Skill {
  name: string;
  endorsements: number;
  proficiency: SkillProficiency;
}

export interface Certification {
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate: Date | null;
  credentialUrl: string | null;
}

export interface Post {
  content: string;
  likes: number;
  comments: number;
  shares: number;
  postedAt: Date;
}

export interface LinkedInProfile {
  headline: string;
  about: string;
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  certifications: Certification[];
  recommendations: number;
  connections: number;
  posts: Post[];
}
