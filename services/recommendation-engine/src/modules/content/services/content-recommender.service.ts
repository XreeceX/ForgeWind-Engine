import { Injectable } from '@nestjs/common';
import { OpenAIService } from '../../../common/services/openai.service';
import {
  UserProfile,
  CareerGoals,
  TopicRecommendation,
  PersonRecommendation,
  CompanyRecommendation,
} from '../../../common/interfaces';

@Injectable()
export class ContentRecommenderService {
  constructor(private readonly openai: OpenAIService) {}

  async recommendTopics(profile: UserProfile): Promise<TopicRecommendation[]> {
    const systemPrompt = [
      'You are a LinkedIn content strategist who recommends high-engagement topics.',
      'You analyze a professional\'s profile to suggest topics they can write about',
      'authentically, that will resonate with their target audience and build authority.',
      'Always respond with valid JSON.',
    ].join(' ');

    const userPrompt = [
      'Recommend 8 LinkedIn content topics for:',
      `Name: ${profile.name}`,
      `Role: ${profile.currentRole}`,
      `Industry: ${profile.industry}`,
      `Skills: ${profile.skills.join(', ')}`,
      `Interests: ${profile.interests.join(', ')}`,
      `Experience: ${profile.experience.map((e) => `${e.title} at ${e.company}`).join('; ')}`,
      '',
      'Respond with JSON: { "topics": [{',
      '  "topic": "specific topic idea",',
      '  "reasoning": "why this will resonate with their audience",',
      '  "contentFormat": "post|article|carousel|poll",',
      '  "targetAudience": "who will engage with this",',
      '  "estimatedEngagement": "high|medium with reasoning",',
      '  "relatedKeywords": ["keyword1", "keyword2"]',
      '}] }',
    ].join('\n');

    const raw = await this.openai.chatCompletion({
      systemPrompt,
      userPrompt,
      temperature: 0.7,
      maxTokens: 3000,
    });

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const topics = Array.isArray(parsed['topics']) ? parsed['topics'] : [];

    return (topics as Record<string, unknown>[]).map((t) => ({
      topic: String(t['topic'] ?? ''),
      reasoning: String(t['reasoning'] ?? ''),
      contentFormat: String(t['contentFormat'] ?? 'post'),
      targetAudience: String(t['targetAudience'] ?? ''),
      estimatedEngagement: String(t['estimatedEngagement'] ?? ''),
      relatedKeywords: Array.isArray(t['relatedKeywords'])
        ? (t['relatedKeywords'] as unknown[]).map(String)
        : [],
    }));
  }

  async recommendPeopleToFollow(profile: UserProfile): Promise<PersonRecommendation[]> {
    const systemPrompt = [
      'You are a networking advisor who recommends thought leaders and influencers',
      'for professionals to follow on LinkedIn. Your recommendations are based on',
      'industry relevance, content quality, and strategic networking value.',
      'Suggest real categories of people (not specific individuals) with actionable engagement tips.',
      'Always respond with valid JSON.',
    ].join(' ');

    const userPrompt = [
      'Recommend types of people to follow and engage with on LinkedIn:',
      `Role: ${profile.currentRole}`,
      `Industry: ${profile.industry}`,
      `Skills: ${profile.skills.join(', ')}`,
      `Interests: ${profile.interests.join(', ')}`,
      '',
      'Respond with JSON: { "people": [{',
      '  "name": "Type/category of person (e.g., \'VP of Engineering at a Series B startup\')",',
      '  "headline": "typical headline they would have",',
      '  "reason": "why following them provides value",',
      '  "commonInterests": ["shared interest 1", "shared interest 2"],',
      '  "engagementTip": "how to meaningfully engage with their content"',
      '}] }',
    ].join('\n');

    const raw = await this.openai.chatCompletion({
      systemPrompt,
      userPrompt,
      temperature: 0.7,
      maxTokens: 3000,
    });

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const people = Array.isArray(parsed['people']) ? parsed['people'] : [];

    return (people as Record<string, unknown>[]).map((p) => ({
      name: String(p['name'] ?? ''),
      headline: String(p['headline'] ?? ''),
      reason: String(p['reason'] ?? ''),
      commonInterests: Array.isArray(p['commonInterests'])
        ? (p['commonInterests'] as unknown[]).map(String)
        : [],
      engagementTip: String(p['engagementTip'] ?? ''),
    }));
  }

  async recommendCompaniesToTarget(
    profile: UserProfile,
    careerGoals: CareerGoals,
  ): Promise<CompanyRecommendation[]> {
    const systemPrompt = [
      'You are a career advisor who recommends companies aligned with a professional\'s',
      'goals, skills, and values. You consider company culture, growth stage, tech stack,',
      'and strategic fit. Recommend categories of companies with actionable connection strategies.',
      'Always respond with valid JSON.',
    ].join(' ');

    const userPrompt = [
      'Recommend types of companies to target:',
      `Current role: ${profile.currentRole}`,
      `Industry: ${profile.industry}`,
      `Skills: ${profile.skills.join(', ')}`,
      `Target role: ${careerGoals.targetRole}`,
      `Target industry: ${careerGoals.targetIndustry}`,
      `Priorities: ${careerGoals.priorities.join(', ')}`,
      `Company size preference: ${careerGoals.preferredCompanySize}`,
      `Remote preference: ${careerGoals.remotePreference}`,
      `Salary expectation: ${careerGoals.salaryExpectation}`,
      '',
      'Respond with JSON: { "companies": [{',
      '  "name": "Type of company (e.g., \'Series B AI/ML startups\')",',
      '  "industry": "...",',
      '  "size": "startup|mid-size|enterprise",',
      '  "whyGoodFit": "why this type of company aligns with their goals",',
      '  "openRoles": ["typical roles they would hire for"],',
      '  "culture": "typical culture description",',
      '  "growthTrajectory": "growth outlook",',
      '  "connectionStrategy": "how to get a foot in the door"',
      '}] }',
    ].join('\n');

    const raw = await this.openai.chatCompletion({
      systemPrompt,
      userPrompt,
      temperature: 0.6,
      maxTokens: 3000,
    });

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const companies = Array.isArray(parsed['companies']) ? parsed['companies'] : [];

    return (companies as Record<string, unknown>[]).map((c) => ({
      name: String(c['name'] ?? ''),
      industry: String(c['industry'] ?? ''),
      size: String(c['size'] ?? ''),
      whyGoodFit: String(c['whyGoodFit'] ?? ''),
      openRoles: Array.isArray(c['openRoles'])
        ? (c['openRoles'] as unknown[]).map(String)
        : [],
      culture: String(c['culture'] ?? ''),
      growthTrajectory: String(c['growthTrajectory'] ?? ''),
      connectionStrategy: String(c['connectionStrategy'] ?? ''),
    }));
  }
}
