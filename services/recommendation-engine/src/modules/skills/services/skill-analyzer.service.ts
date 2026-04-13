import { Injectable } from '@nestjs/common';
import { OpenAIService } from '../../../common/services/openai.service';
import {
  SkillGapAnalysis,
  MatchedSkill,
  MissingSkill,
  LearningStep,
  Resource,
  SkillRelevance,
  SkillDifficulty,
  ResourceType,
  ResourceCost,
} from '../../../common/interfaces';

@Injectable()
export class SkillAnalyzerService {
  constructor(private readonly openai: OpenAIService) {}

  async analyzeSkillGaps(
    userSkills: string[],
    targetRole: string,
  ): Promise<SkillGapAnalysis> {
    const systemPrompt = [
      'You are a career development expert who analyzes skill gaps with precision.',
      'You understand the tech industry skill landscape, role requirements across levels,',
      'and can map learning paths with specific, real resources.',
      'Always respond with valid JSON.',
    ].join(' ');

    const userPrompt = [
      `Analyze skill gaps for someone targeting the role: "${targetRole}"`,
      `Their current skills: ${userSkills.join(', ')}`,
      '',
      'Respond with JSON: {',
      '  "matchedSkills": [{ "skill": "...", "relevance": "critical|important|nice-to-have" }],',
      '  "missingSkills": [{',
      '    "skill": "...",',
      '    "relevance": "critical|important|nice-to-have",',
      '    "difficulty": "easy|moderate|hard",',
      '    "timeToLearn": "estimated time"',
      '  }],',
      '  "overallReadiness": 0-100,',
      '  "prioritizedLearningPath": [{',
      '    "skill": "...",',
      '    "resources": [{',
      '      "name": "...",',
      '      "type": "course|certification|project|book|tutorial",',
      '      "provider": "...",',
      '      "url": "https://...",',
      '      "cost": "free|paid",',
      '      "estimatedHours": 20',
      '    }],',
      '    "estimatedTime": "...",',
      '    "milestone": "what you can do after learning this"',
      '  }]',
      '}',
    ].join('\n');

    const raw = await this.openai.chatCompletion({
      systemPrompt,
      userPrompt,
      temperature: 0.5,
      maxTokens: 4000,
    });

    const parsed = JSON.parse(raw) as Record<string, unknown>;

    return {
      matchedSkills: this.parseMatchedSkills(parsed['matchedSkills']),
      missingSkills: this.parseMissingSkills(parsed['missingSkills']),
      overallReadiness: Math.min(100, Math.max(0, Number(parsed['overallReadiness'] ?? 0))),
      prioritizedLearningPath: this.parseLearningPath(parsed['prioritizedLearningPath']),
    };
  }

  private parseMatchedSkills(value: unknown): MatchedSkill[] {
    if (!Array.isArray(value)) return [];
    return (value as Record<string, unknown>[]).map((s) => ({
      skill: String(s['skill'] ?? ''),
      relevance: this.parseRelevance(s['relevance']),
    }));
  }

  private parseMissingSkills(value: unknown): MissingSkill[] {
    if (!Array.isArray(value)) return [];
    return (value as Record<string, unknown>[]).map((s) => ({
      skill: String(s['skill'] ?? ''),
      relevance: this.parseRelevance(s['relevance']),
      difficulty: this.parseDifficulty(s['difficulty']),
      timeToLearn: String(s['timeToLearn'] ?? ''),
    }));
  }

  private parseLearningPath(value: unknown): LearningStep[] {
    if (!Array.isArray(value)) return [];
    return (value as Record<string, unknown>[]).map((step) => ({
      skill: String(step['skill'] ?? ''),
      resources: this.parseResources(step['resources']),
      estimatedTime: String(step['estimatedTime'] ?? ''),
      milestone: String(step['milestone'] ?? ''),
    }));
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

  private parseRelevance(value: unknown): SkillRelevance {
    const valid: SkillRelevance[] = ['critical', 'important', 'nice-to-have'];
    const str = String(value ?? 'important').toLowerCase() as SkillRelevance;
    return valid.includes(str) ? str : 'important';
  }

  private parseDifficulty(value: unknown): SkillDifficulty {
    const valid: SkillDifficulty[] = ['easy', 'moderate', 'hard'];
    const str = String(value ?? 'moderate').toLowerCase() as SkillDifficulty;
    return valid.includes(str) ? str : 'moderate';
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
