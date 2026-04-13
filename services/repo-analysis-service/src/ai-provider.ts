import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

interface AnalyzeRepositoryRequest {
  name: string;
  fullName: string;
  description: string;
  primaryLanguage: string;
  readme: string;
  files: string[];
}

export interface RepositoryInsight {
  summary: string;
  techStack: string[];
  strengths: string[];
  suggestions: string[];
  complexity: string;
  useCase: string;
}

@Injectable()
export class AiProvider {
  private readonly logger = new Logger(AiProvider.name);
  private readonly client: OpenAI | null;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY', '');
    this.client = apiKey ? new OpenAI({ apiKey }) : null;
    this.model = this.configService.get<string>('OPENAI_MODEL', 'gpt-4o-mini');
  }

  async analyzeRepository(repoData: AnalyzeRepositoryRequest): Promise<RepositoryInsight> {
    if (!this.client) {
      return this.fallbackAnalysis(repoData);
    }

    try {
      const prompt = [
        'Analyze this GitHub repository for personal branding.',
        'Return valid JSON with:',
        '{',
        '  "summary": "string",',
        '  "techStack": ["string"],',
        '  "strengths": ["string"],',
        '  "suggestions": ["string"],',
        '  "complexity": "Beginner|Intermediate|Advanced",',
        '  "useCase": "string"',
        '}',
        `Repo: ${repoData.fullName}`,
        `Description: ${repoData.description}`,
        `Primary language: ${repoData.primaryLanguage}`,
        `Files sample: ${repoData.files.slice(0, 80).join(', ')}`,
        `README excerpt: ${repoData.readme.slice(0, 4000)}`,
      ].join('\n');

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content:
              'You are a senior software architect and career branding coach. Focus on professional positioning and technical depth.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      const content = response.choices[0]?.message.content ?? '{}';
      const parsed = JSON.parse(content) as Record<string, unknown>;

      return {
        summary: String(parsed['summary'] ?? ''),
        techStack: Array.isArray(parsed['techStack'])
          ? (parsed['techStack'] as unknown[]).map(String)
          : [],
        strengths: Array.isArray(parsed['strengths'])
          ? (parsed['strengths'] as unknown[]).map(String)
          : [],
        suggestions: Array.isArray(parsed['suggestions'])
          ? (parsed['suggestions'] as unknown[]).map(String)
          : [],
        complexity: String(parsed['complexity'] ?? 'Intermediate'),
        useCase: String(parsed['useCase'] ?? 'Portfolio project'),
      };
    } catch (error) {
      this.logger.warn(
        `OpenAI analyzeRepository fallback: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
      return this.fallbackAnalysis(repoData);
    }
  }

  private fallbackAnalysis(repoData: AnalyzeRepositoryRequest): RepositoryInsight {
    const techStack = [
      repoData.primaryLanguage,
      ...this.deriveStackFromFiles(repoData.files),
    ].filter((value, index, array) => value && array.indexOf(value) === index);

    return {
      summary: `${repoData.name} appears to be a ${repoData.primaryLanguage} project focused on ${repoData.description || 'practical product delivery'}.`,
      techStack,
      strengths: [
        'Shows hands-on implementation skills',
        'Can be positioned as an end-to-end build example',
      ],
      suggestions: [
        'Add tests and CI indicators to increase hiring confidence',
        'Highlight business outcomes in README for stronger storytelling',
      ],
      complexity: techStack.length > 4 ? 'Advanced' : 'Intermediate',
      useCase: 'Showcase engineering execution and system design decisions',
    };
  }

  private deriveStackFromFiles(files: string[]): string[] {
    const normalized = files.join(' ').toLowerCase();
    const stack: string[] = [];
    if (normalized.includes('docker')) stack.push('Docker');
    if (normalized.includes('terraform')) stack.push('Terraform');
    if (normalized.includes('package.json')) stack.push('Node.js');
    if (normalized.includes('next.config')) stack.push('Next.js');
    if (normalized.includes('nestjs')) stack.push('NestJS');
    return stack;
  }
}
