export interface UserProfile {
  name: string;
  headline: string;
  industry: string;
  currentRole: string;
  experience: WorkExperience[];
  skills: string[];
  education: Education[];
  interests: string[];
  location: string;
}

export interface WorkExperience {
  title: string;
  company: string;
  duration: string;
  description: string;
}

export interface Education {
  degree: string;
  institution: string;
  field: string;
  year: number;
}

export interface CareerGoals {
  targetRole: string;
  targetIndustry: string;
  timeframe: string;
  priorities: string[];
  salaryExpectation: string;
  preferredCompanySize: string;
  remotePreference: 'remote' | 'hybrid' | 'onsite' | 'flexible';
}

export interface MarketTrends {
  topSkills: string[];
  emergingRoles: string[];
  industryGrowth: string;
  demandForecast: string;
}
