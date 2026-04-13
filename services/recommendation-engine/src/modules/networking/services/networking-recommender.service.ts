import { Injectable } from '@nestjs/common';
import { OpenAIService } from '../../../common/services/openai.service';
import {
  UserProfile,
  CareerGoals,
  NetworkAnalysis,
  ConnectionRecommendation,
  NetworkingStrategy,
} from '../../../common/interfaces';

@Injectable()
export class NetworkingRecommenderService {
  constructor(private readonly openai: OpenAIService) {}

  async recommendConnections(
    profile: UserProfile,
    network: NetworkAnalysis,
  ): Promise<ConnectionRecommendation[]> {
    const systemPrompt = [
      'You are a strategic networking advisor who recommends high-value connection targets.',
      'You analyze network composition, identify gaps, and suggest connections that will',
      'accelerate career growth. Focus on strategic diversity — people outside the user\'s',
      'current circle who can open new doors.',
      'Always respond with valid JSON.',
    ].join(' ');

    const industryBreakdown = Object.entries(network.industryBreakdown)
      .map(([industry, count]) => `${industry}: ${count}`)
      .join(', ');

    const seniorityBreakdown = Object.entries(network.seniorityBreakdown)
      .map(([level, count]) => `${level}: ${count}`)
      .join(', ');

    const userPrompt = [
      'Recommend connection targets for strategic networking:',
      `Current role: ${profile.currentRole}`,
      `Industry: ${profile.industry}`,
      `Skills: ${profile.skills.join(', ')}`,
      `Location: ${profile.location}`,
      '',
      'Current network analysis:',
      `Total connections: ${network.totalConnections}`,
      `Industry breakdown: ${industryBreakdown}`,
      `Seniority breakdown: ${seniorityBreakdown}`,
      `Strong ties: ${network.strongTies}, Weak ties: ${network.weakTies}`,
      `Recent activity: ${network.recentActivity}`,
      '',
      'Respond with JSON: { "connections": [{',
      '  "targetRole": "type of person to connect with",',
      '  "targetIndustry": "their industry",',
      '  "reason": "strategic value of this connection",',
      '  "approachStrategy": "how to reach out",',
      '  "messageTemplate": "draft connection message",',
      '  "priority": "high|medium|low"',
      '}] }',
    ].join('\n');

    const raw = await this.openai.chatCompletion({
      systemPrompt,
      userPrompt,
      temperature: 0.7,
      maxTokens: 3000,
    });

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const connections = Array.isArray(parsed['connections']) ? parsed['connections'] : [];

    return (connections as Record<string, unknown>[]).map((c) => ({
      targetRole: String(c['targetRole'] ?? ''),
      targetIndustry: String(c['targetIndustry'] ?? ''),
      reason: String(c['reason'] ?? ''),
      approachStrategy: String(c['approachStrategy'] ?? ''),
      messageTemplate: String(c['messageTemplate'] ?? ''),
      priority: this.parsePriority(c['priority']),
    }));
  }

  async suggestNetworkingStrategy(
    profile: UserProfile,
    goals: CareerGoals,
  ): Promise<NetworkingStrategy> {
    const systemPrompt = [
      'You are a career networking strategist who creates comprehensive networking plans.',
      'You understand that effective networking is systematic, not random.',
      'Create actionable weekly plans that combine online and offline strategies.',
      'Always respond with valid JSON.',
    ].join(' ');

    const userPrompt = [
      'Create a networking strategy:',
      `Current role: ${profile.currentRole}`,
      `Industry: ${profile.industry}`,
      `Skills: ${profile.skills.join(', ')}`,
      `Location: ${profile.location}`,
      `Interests: ${profile.interests.join(', ')}`,
      '',
      'Career goals:',
      `Target role: ${goals.targetRole}`,
      `Target industry: ${goals.targetIndustry}`,
      `Timeframe: ${goals.timeframe}`,
      `Priorities: ${goals.priorities.join(', ')}`,
      '',
      'Respond with JSON: {',
      '  "weeklyGoals": ["actionable weekly goal 1", "goal 2"],',
      '  "targetAudiences": ["audience type 1", "audience type 2"],',
      '  "engagementTactics": ["specific tactic 1", "tactic 2"],',
      '  "events": ["type of event to attend 1", "event 2"],',
      '  "communities": ["community to join 1", "community 2"]',
      '}',
    ].join('\n');

    const raw = await this.openai.chatCompletion({
      systemPrompt,
      userPrompt,
      temperature: 0.7,
      maxTokens: 2500,
    });

    const parsed = JSON.parse(raw) as Record<string, unknown>;

    return {
      weeklyGoals: this.parseStringArray(parsed['weeklyGoals']),
      targetAudiences: this.parseStringArray(parsed['targetAudiences']),
      engagementTactics: this.parseStringArray(parsed['engagementTactics']),
      events: this.parseStringArray(parsed['events']),
      communities: this.parseStringArray(parsed['communities']),
    };
  }

  private parsePriority(value: unknown): 'high' | 'medium' | 'low' {
    const valid = ['high', 'medium', 'low'] as const;
    const str = String(value ?? 'medium').toLowerCase();
    return valid.includes(str as 'high' | 'medium' | 'low')
      ? (str as 'high' | 'medium' | 'low')
      : 'medium';
  }

  private parseStringArray(value: unknown): string[] {
    return Array.isArray(value) ? (value as unknown[]).map(String) : [];
  }
}
