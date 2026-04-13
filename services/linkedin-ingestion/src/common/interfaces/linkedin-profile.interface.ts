export interface LinkedInPosition {
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string | null;
  description: string;
}

export interface LinkedInEducation {
  school: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  activities: string;
  description: string;
}

export interface LinkedInSkill {
  name: string;
}

export interface LinkedInEndorsement {
  skillName: string;
  endorserName: string;
  endorsementDate: string;
}

export interface LinkedInConnection {
  firstName: string;
  lastName: string;
  emailAddress: string;
  company: string;
  position: string;
  connectedOn: string;
}

export interface LinkedInMessage {
  conversationId: string;
  from: string;
  to: string;
  date: string;
  subject: string;
  content: string;
}

export interface LinkedInExportData {
  profile: LinkedInProfileBasic;
  positions: LinkedInPosition[];
  education: LinkedInEducation[];
  skills: LinkedInSkill[];
  endorsements: LinkedInEndorsement[];
  connections: LinkedInConnection[];
  messages: LinkedInMessage[];
}

export interface LinkedInProfileBasic {
  firstName: string;
  lastName: string;
  headline: string;
  summary: string;
  emailAddress: string;
  location: string;
  industry: string;
  profileUrl: string;
}

export interface LinkedInProfile {
  userId: string;
  firstName: string;
  lastName: string;
  headline: string;
  summary: string;
  emailAddress: string;
  location: string;
  industry: string;
  profileUrl: string;
  positions: LinkedInPosition[];
  education: LinkedInEducation[];
  skills: LinkedInSkill[];
  endorsements: LinkedInEndorsement[];
  connections: LinkedInConnection[];
  ingestedAt: Date;
  source: 'export' | 'text' | 'url';
}
