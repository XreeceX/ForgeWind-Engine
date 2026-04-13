import { Injectable } from '@nestjs/common';
import { OpenAIService } from '../../../common/services/openai.service';
import {
  UserProfile,
  MarketTrends,
  SkillRecommendation,
  CertificationRecommendation,
  ProjectRecommendation,
  SkillDifficulty,
  Resource,
  ResourceType,
  ResourceCost,
} from '../../../common/interfaces';

@Injectable()
export class SkillRecommenderService {
  constructor(private readonly openai: OpenAIService) {}

  async recommendSkills(
    profile: UserProfile,
    marketData: MarketTrends,
  ): Promise<SkillRecommendation[]> {
    const systemPrompt = [
      'You are a career strategist who recommends high-impact skills based on',
      'market trends, individual profiles, and career trajectory analysis.',
      'Recommend skills that maximize career ROI — balancing demand, growth potential,',
      'and the individual\'s existing skill adjacencies.',
      'Always respond with valid JSON.',
    ].join(' ');

    const userPrompt = [
      'Recommend skills for this professional:',
      `Name: ${profile.name}`,
      `Current role: ${profile.currentRole}`,
      `Industry: ${profile.industry}`,
      `Current skills: ${profile.skills.join(', ')}`,
      `Interests: ${profile.interests.join(', ')}`,
      '',
      'Market context:',
      `Top skills in demand: ${marketData.topSkills.join(', ')}`,
      `Emerging roles: ${marketData.emergingRoles.join(', ')}`,
      `Industry growth: ${marketData.industryGrowth}`,
      `Demand forecast: ${marketData.demandForecast}`,
      '',
      'Respond with JSON: { "recommendations": [{',
      '  "skill": "...",',
      '  "reasoning": "why this skill matters for them",',
      '  "marketDemand": "high|medium|low with context",',
      '  "relevanceToGoals": "how it connects to their career",',
      '  "difficulty": "easy|moderate|hard",',
      '  "suggestedResources": [{',
      '    "name": "...", "type": "course|certification|project|book|tutorial",',
      '    "provider": "...", "url": "...", "cost": "free|paid", "estimatedHours": 20',
      '  }]',
      '}] }',
    ].join('\n');

    const raw = await this.openai.chatCompletion({
      systemPrompt,
      userPrompt,
      temperature: 0.6,
      maxTokens: 4000,
    });

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const recs = Array.isArray(parsed['recommendations']) ? parsed['recommendations'] : [];

    return (recs as Record<string, unknown>[]).map((r) => ({
      skill: String(r['skill'] ?? ''),
      reasoning: String(r['reasoning'] ?? ''),
      marketDemand: String(r['marketDemand'] ?? ''),
      relevanceToGoals: String(r['relevanceToGoals'] ?? ''),
      difficulty: this.parseDifficulty(r['difficulty']),
      suggestedResources: this.parseResources(r['suggestedResources']),
    }));
  }

  async recommendCertifications(
    profile: UserProfile,
    targetRole: string,
  ): Promise<CertificationRecommendation[]> {
    const systemPrompt = [
      'You are a certification advisor who recommends the most impactful professional',
      'certifications based on career goals and existing skills.',
      'Focus on certifications that are recognized by employers and provide measurable career value.',
      'Always respond with valid JSON.',
    ].join(' ');

    const userPrompt = [
      'Recommend certifications:',
      `Current role: ${profile.currentRole}`,
      `Target role: ${targetRole}`,
      `Industry: ${profile.industry}`,
      `Existing skills: ${profile.skills.join(', ')}`,
      `Education: ${profile.education.map((e) => `${e.degree} in ${e.field} from ${e.institution}`).join('; ')}`,
      '',
      'Respond with JSON: { "certifications": [{',
      '  "name": "certification name",',
      '  "provider": "certifying body",',
      '  "cost": "approximate cost",',
      '  "duration": "time to complete",',
      '  "relevance": "why this cert matters for the target role",',
      '  "careerImpact": "expected career impact",',
      '  "url": "https://..."',
      '}] }',
    ].join('\n');

    const raw = await this.openai.chatCompletion({
      systemPrompt,
      userPrompt,
      temperature: 0.5,
      maxTokens: 3000,
    });

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const certs = Array.isArray(parsed['certifications']) ? parsed['certifications'] : [];

    return (certs as Record<string, unknown>[]).map((c) => ({
      name: String(c['name'] ?? ''),
      provider: String(c['provider'] ?? ''),
      cost: String(c['cost'] ?? ''),
      duration: String(c['duration'] ?? ''),
      relevance: String(c['relevance'] ?? ''),
      careerImpact: String(c['careerImpact'] ?? ''),
      url: String(c['url'] ?? ''),
    }));
  }

  async recommendProjects(
    skills: string[],
    targetRole: string,
  ): Promise<ProjectRecommendation[]> {
    const systemPrompt = [
      'You are a portfolio advisor who recommends projects that demonstrate',
      'relevant skills to hiring managers. Projects should be practical,',
      'impressive on a resume, and teach transferable skills.',
      'Always respond with valid JSON.',
    ].join(' ');

    const userPrompt = [
      'Recommend portfolio projects:',
      `Current skills: ${skills.join(', ')}`,
      `Target role: ${targetRole}`,
      '',
      'Respond with JSON: { "projects": [{',
      '  "title": "project name",',
      '  "description": "what to build",',
      '  "skills": ["skill1", "skill2"],',
      '  "complexity": "easy|moderate|hard",',
      '  "estimatedTime": "time to complete",',
      '  "portfolioValue": "why this impresses hiring managers",',
      '  "learningOutcomes": ["what you will learn"]',
      '}] }',
    ].join('\n');

    const raw = await this.openai.chatCompletion({
      systemPrompt,
      userPrompt,
      temperature: 0.7,
      maxTokens: 3000,
    });

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const projects = Array.isArray(parsed['projects']) ? parsed['projects'] : [];

    return (projects as Record<string, unknown>[]).map((p) => ({
      title: String(p['title'] ?? ''),
      description: String(p['description'] ?? ''),
      skills: Array.isArray(p['skills']) ? (p['skills'] as unknown[]).map(String) : [],
      complexity: this.parseDifficulty(p['complexity']),
      estimatedTime: String(p['estimatedTime'] ?? ''),
      portfolioValue: String(p['portfolioValue'] ?? ''),
      learningOutcomes: Array.isArray(p['learningOutcomes'])
        ? (p['learningOutcomes'] as unknown[]).map(String)
        : [],
    }));
  }

  private parseDifficulty(value: unknown): SkillDifficulty {
    const valid: SkillDifficulty[] = ['easy', 'moderate', 'hard'];
    const str = String(value ?? 'moderate').toLowerCase() as SkillDifficulty;
    return valid.includes(str) ? str : 'moderate';
  }

  private parseResources(value: unknown): Resource[] {
    if (!Array.isArray(value)) return [];
    return (value as Record<string, unknown>[]).map((r) => ({
      name: String(r['name'] ?? ''),
      type: this.parseResourceType(r['type']),
      provider: String(r['provider'] ?? ''),
      url: String(r['url'] ?? ''),
      cost: this.parseResourceCost(r['cost']),
      estimatedHours: Number(r['estimatedHours'] ?? 0),
    }));
  }

  private parseResourceType(value: unknown): ResourceType {
    const valid: ResourceType[] = ['course', 'certification', 'project', 'book', 'tutorial'];
    const str = String(value ?? 'course').toLowerCase() as ResourceType;
    return valid.includes(str) ? str : 'course';
  }

  private parseResourceCost(value: unknown): ResourceCost {
    const valid: ResourceCost[] = ['free', 'paid'];
    const str = String(value ?? 'free').toLowerCase() as ResourceCost;
    return valid.includes(str) ? str : 'free';
  }
}
