import { Injectable } from '@nestjs/common';
import { OpenAIService } from '../../generation/services/openai.service';
import {
  CalendarParams,
  ContentCalendar,
  WeekPlan,
  PlannedPost,
  PostPerformance,
  ContentInsights,
  TopicSuggestionParams,
  TopicSuggestions,
  SuggestedTopic,
  ContentType,
} from '../../../common/interfaces';

@Injectable()
export class StrategyService {
  constructor(private readonly openai: OpenAIService) {}

  async generateContentCalendar(params: CalendarParams): Promise<ContentCalendar> {
    const systemPrompt = [
      'You are a LinkedIn content strategist who builds data-driven content calendars.',
      'You understand posting cadence, content mix, audience engagement patterns,',
      'and the LinkedIn algorithm. Create actionable, specific content plans.',
      'Always respond with valid JSON.',
    ].join(' ');

    const userPrompt = [
      'Create a LinkedIn content calendar:',
      `Industry: ${params.industry}`,
      `Role: ${params.role}`,
      `Expertise: ${params.expertise.join(', ')}`,
      `Goals: ${params.goals.join('; ')}`,
      `Duration: ${params.weeksCount} weeks, ${params.postsPerWeek} posts per week`,
      '',
      'For each planned post include: dayOfWeek, topic, contentType (text|image|carousel|article|poll),',
      'hook (the opening line), keyPoints (array), callToAction, estimatedEngagement.',
      '',
      'Respond with JSON: {',
      '  "weeks": [{ "weekNumber": 1, "posts": [...] }],',
      '  "overallTheme": "...",',
      '  "goals": ["goal1", "goal2"]',
      '}',
    ].join('\n');

    const raw = await this.openai.chatCompletion({
      systemPrompt,
      userPrompt,
      temperature: 0.7,
      maxTokens: 4000,
    });

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const weeksRaw = Array.isArray(parsed['weeks']) ? parsed['weeks'] : [];

    const weeks: WeekPlan[] = (weeksRaw as Record<string, unknown>[]).map((w) => {
      const postsRaw = Array.isArray(w['posts']) ? w['posts'] : [];
      const posts: PlannedPost[] = (postsRaw as Record<string, unknown>[]).map((p) => ({
        dayOfWeek: String(p['dayOfWeek'] ?? ''),
        topic: String(p['topic'] ?? ''),
        contentType: this.parseContentType(p['contentType']),
        hook: String(p['hook'] ?? ''),
        keyPoints: Array.isArray(p['keyPoints'])
          ? (p['keyPoints'] as unknown[]).map(String)
          : [],
        callToAction: String(p['callToAction'] ?? ''),
        estimatedEngagement: String(p['estimatedEngagement'] ?? ''),
      }));

      return {
        weekNumber: Number(w['weekNumber'] ?? 0),
        posts,
      };
    });

    return {
      weeks,
      overallTheme: String(parsed['overallTheme'] ?? ''),
      goals: Array.isArray(parsed['goals'])
        ? (parsed['goals'] as unknown[]).map(String)
        : [],
    };
  }

  async analyzeContentPerformance(posts: PostPerformance[]): Promise<ContentInsights> {
    const systemPrompt = [
      'You are a LinkedIn analytics expert who identifies patterns in content performance.',
      'You analyze engagement metrics, content types, timing, and topics to provide',
      'actionable recommendations for improving reach and engagement.',
      'Always respond with valid JSON.',
    ].join(' ');

    const postsData = posts.map((p) => ({
      topic: p.topic,
      contentType: p.contentType,
      likes: p.likes,
      comments: p.comments,
      shares: p.shares,
      impressions: p.impressions,
      postedAt: p.postedAt,
      engagementRate:
        p.impressions > 0
          ? (((p.likes + p.comments + p.shares) / p.impressions) * 100).toFixed(2) + '%'
          : '0%',
    }));

    const avgEngagement =
      posts.length > 0
        ? posts.reduce((sum, p) => {
            const engagement = p.impressions > 0
              ? ((p.likes + p.comments + p.shares) / p.impressions) * 100
              : 0;
            return sum + engagement;
          }, 0) / posts.length
        : 0;

    const userPrompt = [
      'Analyze these LinkedIn post performance metrics:',
      JSON.stringify(postsData, null, 2),
      '',
      `Average engagement rate: ${avgEngagement.toFixed(2)}%`,
      '',
      'Respond with JSON: {',
      '  "topPerformingTopics": ["topic1", "topic2"],',
      '  "bestContentTypes": ["type1", "type2"],',
      '  "bestPostingTimes": ["time1", "time2"],',
      '  "averageEngagementRate": 3.5,',
      '  "recommendations": ["rec1", "rec2"],',
      '  "trendAnalysis": "overall trend summary"',
      '}',
    ].join('\n');

    const raw = await this.openai.chatCompletion({
      systemPrompt,
      userPrompt,
      temperature: 0.5,
      maxTokens: 2000,
    });

    const parsed = JSON.parse(raw) as Record<string, unknown>;

    return {
      topPerformingTopics: this.parseStringArray(parsed['topPerformingTopics']),
      bestContentTypes: this.parseStringArray(parsed['bestContentTypes']),
      bestPostingTimes: this.parseStringArray(parsed['bestPostingTimes']),
      averageEngagementRate: Number(parsed['averageEngagementRate'] ?? avgEngagement),
      recommendations: this.parseStringArray(parsed['recommendations']),
      trendAnalysis: String(parsed['trendAnalysis'] ?? ''),
    };
  }

  async suggestTopics(params: TopicSuggestionParams): Promise<TopicSuggestions> {
    const systemPrompt = [
      'You are a LinkedIn content strategist who suggests viral-worthy topics.',
      'You combine industry trends, personal expertise, and audience interests',
      'to suggest topics that will drive engagement and establish thought leadership.',
      'Always respond with valid JSON.',
    ].join(' ');

    const userPrompt = [
      'Suggest 10 LinkedIn content topics for this professional:',
      `Industry: ${params.industry}`,
      `Expertise: ${params.expertise.join(', ')}`,
      `Recent topics (avoid repeating): ${params.recentTopics.join(', ')}`,
      `Target audience: ${params.targetAudience}`,
      '',
      'Respond with JSON: {',
      '  "topics": [',
      '    {',
      '      "topic": "...",',
      '      "reasoning": "why this topic will perform well",',
      '      "contentType": "text|image|carousel|article|poll",',
      '      "angle": "unique angle to take",',
      '      "estimatedRelevance": "high|medium"',
      '    }',
      '  ],',
      '  "trendingInIndustry": ["trend1", "trend2"]',
      '}',
    ].join('\n');

    const raw = await this.openai.chatCompletion({
      systemPrompt,
      userPrompt,
      temperature: 0.8,
      maxTokens: 3000,
    });

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const topicsRaw = Array.isArray(parsed['topics']) ? parsed['topics'] : [];

    const topics: SuggestedTopic[] = (topicsRaw as Record<string, unknown>[]).map((t) => ({
      topic: String(t['topic'] ?? ''),
      reasoning: String(t['reasoning'] ?? ''),
      contentType: this.parseContentType(t['contentType']),
      angle: String(t['angle'] ?? ''),
      estimatedRelevance: String(t['estimatedRelevance'] ?? 'medium'),
    }));

    return {
      topics,
      trendingInIndustry: this.parseStringArray(parsed['trendingInIndustry']),
    };
  }

  private parseContentType(value: unknown): ContentType {
    const valid: ContentType[] = ['text', 'image', 'carousel', 'article', 'poll'];
    const str = String(value ?? 'text').toLowerCase() as ContentType;
    return valid.includes(str) ? str : 'text';
  }

  private parseStringArray(value: unknown): string[] {
    return Array.isArray(value) ? (value as unknown[]).map(String) : [];
  }
}
