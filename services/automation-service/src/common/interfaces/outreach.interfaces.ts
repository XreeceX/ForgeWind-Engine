export interface EmailParams {
  to: string;
  subject: string;
  body: string;
  replyTo: string | null;
}

export interface EmailResult {
  success: boolean;
  messageId: string | null;
  error: string | null;
}

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed';

export interface OutreachTarget {
  name: string;
  email: string;
  company: string;
  role: string;
  personalization: Record<string, string>;
}

export interface Campaign {
  id: string;
  userId: string;
  name: string;
  targets: OutreachTarget[];
  template: string;
  status: CampaignStatus;
  createdAt: Date;
}

export interface CampaignParams {
  userId: string;
  name: string;
  targets: OutreachTarget[];
  template: string;
}

export interface OutreachResultEntry {
  target: OutreachTarget;
  email: EmailResult;
  sentAt: Date;
}

export interface OutreachResult {
  campaignId: string;
  totalSent: number;
  totalFailed: number;
  results: OutreachResultEntry[];
}

export interface OutreachHistoryEntry {
  campaignId: string;
  campaignName: string;
  totalTargets: number;
  totalSent: number;
  totalFailed: number;
  status: CampaignStatus;
  createdAt: Date;
}

export interface OutreachHistory {
  campaigns: OutreachHistoryEntry[];
  totalCampaigns: number;
  totalEmailsSent: number;
  overallSuccessRate: number;
}
