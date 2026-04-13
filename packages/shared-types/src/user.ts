export enum UserRole {
  FREE = "FREE",
  PRO = "PRO",
  ENTERPRISE = "ENTERPRISE",
}

export enum RemotePreference {
  REMOTE = "REMOTE",
  HYBRID = "HYBRID",
  ONSITE = "ONSITE",
  ANY = "ANY",
}

export interface CareerGoals {
  targetRole: string | null;
  targetIndustry: string[] | null;
  targetCompanies: string[] | null;
  salaryRange: { min: number; max: number; currency: string } | null;
  willingToRelocate: boolean;
  remotePreference: RemotePreference;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  linkedinUrl: string | null;
  avatarUrl: string | null;
  role: UserRole;
  careerGoals: CareerGoals;
  createdAt: Date;
  updatedAt: Date;
}
