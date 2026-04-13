export interface Connection {
  name: string;
  title: string;
  company: string;
  connectedDate: string;
}

export interface NetworkAnalysis {
  totalConnections: number;
  industryBreakdown: Record<string, number>;
  companyBreakdown: Record<string, number>;
  seniorityBreakdown: Record<string, number>;
  networkStrength: string;
  recommendations: string[];
}
