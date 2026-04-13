import { Injectable, Logger } from '@nestjs/common';
import { Connection, NetworkAnalysis } from '../../common/interfaces';

const SENIORITY_KEYWORDS: Record<string, string[]> = {
  'C-Suite': ['ceo', 'cto', 'cfo', 'coo', 'cmo', 'cio', 'chief'],
  'VP': ['vp', 'vice president'],
  'Director': ['director'],
  'Manager': ['manager', 'head of', 'lead'],
  'Senior': ['senior', 'sr.', 'sr ', 'principal', 'staff'],
  'Mid-Level': ['analyst', 'engineer', 'developer', 'designer', 'specialist', 'consultant'],
  'Entry-Level': ['intern', 'junior', 'jr.', 'jr ', 'associate', 'assistant', 'trainee'],
};

@Injectable()
export class NetworkService {
  private readonly logger = new Logger(NetworkService.name);

  async analyzeNetwork(connections: Connection[]): Promise<NetworkAnalysis> {
    this.logger.log(`Analyzing network of ${connections.length} connections`);

    const totalConnections = connections.length;
    const industryBreakdown = this.buildIndustryBreakdown(connections);
    const companyBreakdown = this.buildCompanyBreakdown(connections);
    const seniorityBreakdown = this.buildSeniorityBreakdown(connections);
    const networkStrength = this.assessNetworkStrength(
      totalConnections,
      industryBreakdown,
      seniorityBreakdown,
    );
    const recommendations = this.generateRecommendations(
      totalConnections,
      industryBreakdown,
      companyBreakdown,
      seniorityBreakdown,
    );

    return {
      totalConnections,
      industryBreakdown,
      companyBreakdown,
      seniorityBreakdown,
      networkStrength,
      recommendations,
    };
  }

  private buildIndustryBreakdown(connections: Connection[]): Record<string, number> {
    const breakdown: Record<string, number> = {};

    for (const conn of connections) {
      const industry = this.inferIndustryFromTitle(conn.title, conn.company);
      breakdown[industry] = (breakdown[industry] ?? 0) + 1;
    }

    return this.sortByValueDesc(breakdown);
  }

  private buildCompanyBreakdown(connections: Connection[]): Record<string, number> {
    const breakdown: Record<string, number> = {};

    for (const conn of connections) {
      const company = conn.company.trim() || 'Unknown';
      breakdown[company] = (breakdown[company] ?? 0) + 1;
    }

    return this.sortByValueDesc(breakdown);
  }

  private buildSeniorityBreakdown(connections: Connection[]): Record<string, number> {
    const breakdown: Record<string, number> = {};

    for (const conn of connections) {
      const seniority = this.classifySeniority(conn.title);
      breakdown[seniority] = (breakdown[seniority] ?? 0) + 1;
    }

    return this.sortByValueDesc(breakdown);
  }

  private classifySeniority(title: string): string {
    const normalized = title.toLowerCase();

    for (const [level, keywords] of Object.entries(SENIORITY_KEYWORDS)) {
      if (keywords.some((kw) => normalized.includes(kw))) {
        return level;
      }
    }

    return 'Other';
  }

  private inferIndustryFromTitle(title: string, company: string): string {
    const combined = `${title} ${company}`.toLowerCase();

    const industrySignals: Record<string, string[]> = {
      'Technology': ['software', 'engineer', 'developer', 'tech', 'saas', 'cloud', 'data', 'ai', 'ml', 'devops'],
      'Finance': ['finance', 'banking', 'investment', 'fintech', 'trading', 'asset', 'capital'],
      'Healthcare': ['health', 'medical', 'pharma', 'biotech', 'clinical', 'hospital', 'nurse', 'doctor'],
      'Marketing': ['marketing', 'brand', 'advertising', 'social media', 'content', 'seo', 'growth'],
      'Sales': ['sales', 'account executive', 'business development', 'revenue'],
      'Consulting': ['consultant', 'consulting', 'advisory', 'strategy'],
      'Education': ['education', 'teacher', 'professor', 'university', 'academic', 'school'],
      'Legal': ['lawyer', 'attorney', 'legal', 'law firm', 'counsel'],
      'Design': ['design', 'ux', 'ui', 'creative', 'graphic'],
      'HR': ['human resources', 'recruiter', 'recruiting', 'talent', 'people operations'],
      'Operations': ['operations', 'supply chain', 'logistics', 'procurement'],
      'Product': ['product manager', 'product owner', 'product lead'],
    };

    for (const [industry, signals] of Object.entries(industrySignals)) {
      if (signals.some((signal) => combined.includes(signal))) {
        return industry;
      }
    }

    return 'Other';
  }

  private assessNetworkStrength(
    totalConnections: number,
    industryBreakdown: Record<string, number>,
    seniorityBreakdown: Record<string, number>,
  ): string {
    let score = 0;

    if (totalConnections >= 500) score += 3;
    else if (totalConnections >= 200) score += 2;
    else if (totalConnections >= 50) score += 1;

    const industryCount = Object.keys(industryBreakdown).length;
    if (industryCount >= 5) score += 2;
    else if (industryCount >= 3) score += 1;

    const seniorityLevels = Object.keys(seniorityBreakdown).length;
    if (seniorityLevels >= 4) score += 2;
    else if (seniorityLevels >= 2) score += 1;

    const hasSeniorConnections =
      (seniorityBreakdown['C-Suite'] ?? 0) > 0 ||
      (seniorityBreakdown['VP'] ?? 0) > 0 ||
      (seniorityBreakdown['Director'] ?? 0) > 0;
    if (hasSeniorConnections) score += 1;

    if (score >= 7) return 'Excellent';
    if (score >= 5) return 'Strong';
    if (score >= 3) return 'Moderate';
    if (score >= 1) return 'Developing';
    return 'Needs attention';
  }

  private generateRecommendations(
    totalConnections: number,
    industryBreakdown: Record<string, number>,
    companyBreakdown: Record<string, number>,
    seniorityBreakdown: Record<string, number>,
  ): string[] {
    const recommendations: string[] = [];

    if (totalConnections < 100) {
      recommendations.push(
        'Grow your network to at least 500 connections for maximum visibility on LinkedIn',
      );
    } else if (totalConnections < 500) {
      recommendations.push(
        'Continue growing toward 500+ connections — profiles with 500+ appear more credible',
      );
    }

    const industryCount = Object.keys(industryBreakdown).length;
    if (industryCount < 3) {
      recommendations.push(
        'Diversify your network across more industries to discover cross-functional opportunities',
      );
    }

    const seniorCount =
      (seniorityBreakdown['C-Suite'] ?? 0) +
      (seniorityBreakdown['VP'] ?? 0) +
      (seniorityBreakdown['Director'] ?? 0);
    const seniorPercent = totalConnections > 0 ? (seniorCount / totalConnections) * 100 : 0;

    if (seniorPercent < 10) {
      recommendations.push(
        'Connect with more senior professionals (Directors, VPs, C-Suite) to expand your influence',
      );
    }

    const topCompanies = Object.entries(companyBreakdown).slice(0, 3);
    if (topCompanies.length > 0) {
      const topCompany = topCompanies[0]!;
      const topPercent = totalConnections > 0 ? (topCompany[1] / totalConnections) * 100 : 0;
      if (topPercent > 30) {
        recommendations.push(
          `Your network is heavily concentrated at ${topCompany[0]} (${Math.round(topPercent)}%) — diversify across companies`,
        );
      }
    }

    const hasRecruiters = (seniorityBreakdown['HR'] ?? 0) > 0;
    if (!hasRecruiters) {
      recommendations.push(
        'Connect with recruiters and talent acquisition professionals in your target companies',
      );
    }

    recommendations.push(
      'Regularly engage with your connections\' posts to maintain relationship strength',
    );

    return recommendations;
  }

  private sortByValueDesc(record: Record<string, number>): Record<string, number> {
    return Object.fromEntries(
      Object.entries(record).sort((a, b) => b[1] - a[1]),
    );
  }
}
