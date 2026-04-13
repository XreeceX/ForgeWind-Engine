import { Injectable } from '@nestjs/common';
import { OpenAIService } from './openai.service';
import {
  PostGenerationParams,
  GeneratedContent,
  HeadlineParams,
  GeneratedHeadlines,
  AboutParams,
  GeneratedAbout,
  ExperienceRewriteParams,
  RewrittenExperience,
  ColdEmailParams,
  GeneratedEmail,
  RewriteParams,
  RewrittenText,
} from '../../../common/interfaces';

const LENGTH_GUIDANCE: Record<string, string> = {
  short: '50-100 words. Punchy and direct.',
  medium: '100-200 words. Balanced depth with readability.',
  long: '200-350 words. In-depth narrative with multiple paragraphs.',
};

@Injectable()
export class GenerationService {
  constructor(private readonly openai: OpenAIService) {}

  async generateLinkedInPost(params: PostGenerationParams): Promise<GeneratedContent> {
    const systemPrompt = [
      'You are an expert LinkedIn ghostwriter who creates engaging, high-performing posts.',
      'You understand LinkedIn algorithm mechanics: strong hooks, line breaks for readability,',
      'storytelling arcs, and clear calls to action drive engagement.',
      'Always respond with valid JSON matching the specified schema.',
    ].join(' ');

    const userPrompt = [
      `Write a LinkedIn post about: "${params.topic}"`,
      `Tone: ${params.tone}`,
      `Length: ${LENGTH_GUIDANCE[params.length] ?? LENGTH_GUIDANCE['medium']}`,
      `Author context: ${params.userContext.role} in ${params.userContext.industry},`,
      `expert in ${params.userContext.expertise.join(', ')}`,
      params.includeHashtags ? 'Include 3-5 relevant hashtags.' : 'Do not include hashtags.',
      params.includeEmoji ? 'Use emojis sparingly for emphasis.' : 'Do not use emojis.',
      '',
      'Respond with JSON: {',
      '  "content": "the full post text",',
      '  "hashtags": ["hashtag1", "hashtag2"],',
      '  "estimatedEngagement": "brief engagement prediction",',
      '  "variations": ["alternative version 1", "alternative version 2"]',
      '}',
    ].join('\n');

    const raw = await this.openai.chatCompletion({
      systemPrompt,
      userPrompt,
      temperature: 0.8,
      maxTokens: 3000,
    });

    const parsed = JSON.parse(raw) as Record<string, unknown>;

    return {
      content: String(parsed['content'] ?? ''),
      hashtags: Array.isArray(parsed['hashtags'])
        ? (parsed['hashtags'] as unknown[]).map(String)
        : [],
      estimatedEngagement: String(parsed['estimatedEngagement'] ?? ''),
      variations: Array.isArray(parsed['variations'])
        ? (parsed['variations'] as unknown[]).map(String)
        : [],
    };
  }

  async generateHeadline(params: HeadlineParams): Promise<GeneratedHeadlines> {
    const systemPrompt = [
      'You are a LinkedIn profile optimization expert.',
      'You craft headlines that are keyword-rich, memorable, and convey unique value.',
      'Great headlines combine role clarity with a compelling value proposition.',
      'Always respond with valid JSON.',
    ].join(' ');

    const userPrompt = [
      'Generate 5 LinkedIn headline options for this professional:',
      `Current headline: "${params.currentHeadline}"`,
      `Role: ${params.role}`,
      `Industry: ${params.industry}`,
      `Key skills: ${params.skills.join(', ')}`,
      `Value proposition: ${params.valueProposition}`,
      '',
      'Respond with JSON: {',
      '  "options": [',
      '    { "headline": "...", "reasoning": "why this works" }',
      '  ]',
      '}',
    ].join('\n');

    const raw = await this.openai.chatCompletion({
      systemPrompt,
      userPrompt,
      temperature: 0.8,
      maxTokens: 1500,
    });

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const options = Array.isArray(parsed['options']) ? parsed['options'] : [];

    return {
      options: (options as Record<string, unknown>[]).map((opt) => ({
        headline: String(opt['headline'] ?? ''),
        reasoning: String(opt['reasoning'] ?? ''),
      })),
    };
  }

  async generateAboutSection(params: AboutParams): Promise<GeneratedAbout> {
    const systemPrompt = [
      'You are a LinkedIn profile copywriter who writes compelling About sections.',
      'Great About sections tell a story, showcase expertise, include keywords for search,',
      'and end with a clear call to action. Keep it under 2600 characters (LinkedIn limit).',
      'Always respond with valid JSON.',
    ].join(' ');

    const userPrompt = [
      'Rewrite this LinkedIn About section:',
      `Current: "${params.currentAbout}"`,
      `Role: ${params.role}`,
      `Industry: ${params.industry}`,
      `Experience highlights: ${params.experience.join('; ')}`,
      `Skills: ${params.skills.join(', ')}`,
      `Achievements: ${params.achievements.join('; ')}`,
      `Target audience: ${params.targetAudience}`,
      '',
      'Respond with JSON: {',
      '  "aboutSection": "the full rewritten about section",',
      '  "keywordHighlights": ["keyword1", "keyword2"],',
      '  "characterCount": 1234',
      '}',
    ].join('\n');

    const raw = await this.openai.chatCompletion({
      systemPrompt,
      userPrompt,
      temperature: 0.7,
      maxTokens: 2000,
    });

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const aboutSection = String(parsed['aboutSection'] ?? '');

    return {
      aboutSection,
      keywordHighlights: Array.isArray(parsed['keywordHighlights'])
        ? (parsed['keywordHighlights'] as unknown[]).map(String)
        : [],
      characterCount: aboutSection.length,
    };
  }

  async rewriteExperience(params: ExperienceRewriteParams): Promise<RewrittenExperience> {
    const systemPrompt = [
      'You are an expert resume and LinkedIn profile writer.',
      'You transform bland experience descriptions into powerful, quantified achievement statements.',
      'Use strong action verbs, add metrics where plausible, and optimize for ATS keywords.',
      'Always respond with valid JSON.',
    ].join(' ');

    const userPrompt = [
      `Rewrite these experience bullets for ${params.jobTitle} at ${params.company}:`,
      ...params.originalBullets.map((b, i) => `${i + 1}. ${b}`),
      `Industry: ${params.industry}`,
      params.targetRole ? `Target role: ${params.targetRole}` : '',
      '',
      'Respond with JSON: {',
      '  "bullets": [',
      '    {',
      '      "original": "original text",',
      '      "rewritten": "improved text",',
      '      "improvements": ["what was improved"]',
      '    }',
      '  ],',
      '  "summary": "brief overview of all changes made"',
      '}',
    ].join('\n');

    const raw = await this.openai.chatCompletion({
      systemPrompt,
      userPrompt,
      temperature: 0.6,
      maxTokens: 2500,
    });

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const bullets = Array.isArray(parsed['bullets']) ? parsed['bullets'] : [];

    return {
      bullets: (bullets as Record<string, unknown>[]).map((b) => ({
        original: String(b['original'] ?? ''),
        rewritten: String(b['rewritten'] ?? ''),
        improvements: Array.isArray(b['improvements'])
          ? (b['improvements'] as unknown[]).map(String)
          : [],
      })),
      summary: String(parsed['summary'] ?? ''),
    };
  }

  async generateColdEmail(params: ColdEmailParams): Promise<GeneratedEmail> {
    const systemPrompt = [
      'You are a cold outreach specialist who writes highly personalized, concise emails.',
      'Great cold emails have a compelling subject line, establish credibility fast,',
      'reference common ground, and have a single clear ask. Keep the body under 150 words.',
      'Always respond with valid JSON.',
    ].join(' ');

    const userPrompt = [
      'Write a personalized cold email:',
      `From: ${params.senderName} (${params.senderRole})`,
      `To: ${params.recipientName} (${params.recipientRole} at ${params.recipientCompany})`,
      `Purpose: ${params.purpose}`,
      `Common ground: ${params.commonGround.join('; ')}`,
      `Tone: ${params.tone}`,
      '',
      'Respond with JSON: {',
      '  "subject": "email subject line",',
      '  "body": "email body text",',
      '  "callToAction": "the specific ask",',
      '  "followUpSuggestion": "suggested follow-up timing and approach"',
      '}',
    ].join('\n');

    const raw = await this.openai.chatCompletion({
      systemPrompt,
      userPrompt,
      temperature: 0.7,
      maxTokens: 1500,
    });

    const parsed = JSON.parse(raw) as Record<string, unknown>;

    return {
      subject: String(parsed['subject'] ?? ''),
      body: String(parsed['body'] ?? ''),
      callToAction: String(parsed['callToAction'] ?? ''),
      followUpSuggestion: String(parsed['followUpSuggestion'] ?? ''),
    };
  }

  async rewriteText(params: RewriteParams): Promise<RewrittenText> {
    const systemPrompt = [
      'You are a professional writing assistant specializing in tone adjustment and clarity.',
      'You rewrite text to match the requested tone while preserving the core message.',
      'Always respond with valid JSON.',
    ].join(' ');

    const userPrompt = [
      'Rewrite the following text:',
      `Original: "${params.originalText}"`,
      `Target tone: ${params.targetTone}`,
      `Purpose: ${params.purpose}`,
      '',
      'Respond with JSON: {',
      '  "rewrittenText": "the rewritten text",',
      '  "changes": ["description of change 1", "description of change 2"]',
      '}',
    ].join('\n');

    const raw = await this.openai.chatCompletion({
      systemPrompt,
      userPrompt,
      temperature: 0.6,
      maxTokens: 2000,
    });

    const parsed = JSON.parse(raw) as Record<string, unknown>;

    return {
      rewrittenText: String(parsed['rewrittenText'] ?? ''),
      changes: Array.isArray(parsed['changes'])
        ? (parsed['changes'] as unknown[]).map(String)
        : [],
    };
  }
}
