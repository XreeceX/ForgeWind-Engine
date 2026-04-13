import { ApplicationStatus } from './job.interfaces';

export interface Application {
  id: string;
  userId: string;
  jobId: string;
  jobTitle: string;
  company: string;
  status: ApplicationStatus;
  notes: string | null;
  appliedAt: Date;
  updatedAt: Date;
}

export interface ApplicationFilters {
  status?: ApplicationStatus;
  company?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface ApplicationStats {
  total: number;
  byStatus: Record<ApplicationStatus, number>;
  responseRate: number;
  avgTimeToResponse: number | null;
  topCompanies: string[];
}
