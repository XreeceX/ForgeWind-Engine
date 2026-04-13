import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { Job, UserProfile } from '../../../common/interfaces';

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private readonly client: OpenAI | null;
  private readonly model: string;
  private readonly cache = new Map<string, { embedding: number[]; timestamp: number }>();
  private readonly cacheTtlMs = 1000 * 60 * 60; // 1 hour

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.model = this.configService.get<string>(
      'OPENAI_EMBEDDING_MODEL',
      'text-embedding-3-small',
    );

    if (apiKey) {
      this.client = new OpenAI({ apiKey });
      this.logger.log('OpenAI client initialized for embeddings');
    } else {
      this.client = null;
      this.logger.warn(
        'OPENAI_API_KEY not configured — embeddings will use mock vectors',
      );
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const cached = this.getFromCache(text);
    if (cached) return cached;

    let embedding: number[];

    if (this.client) {
      const response = await this.client.embeddings.create({
        model: this.model,
        input: text,
      });
      embedding = response.data[0]?.embedding ?? this.generateMockEmbedding(text);
    } else {
      embedding = this.generateMockEmbedding(text);
    }

    this.setCache(text, embedding);
    return embedding;
  }

  async generateJobEmbedding(job: Job): Promise<number[]> {
    const composite = [
      `Title: ${job.title}`,
      `Company: ${job.company}`,
      `Description: ${job.description}`,
      `Skills: ${job.skills.join(', ')}`,
      `Requirements: ${job.requirements.join('. ')}`,
      `Type: ${job.jobType}`,
      `Level: ${job.experienceLevel}`,
      `Location: ${job.location}`,
      job.remote ? 'Remote: Yes' : 'Remote: No',
    ].join('\n');

    return this.generateEmbedding(composite);
  }

  async generateProfileEmbedding(profile: UserProfile): Promise<number[]> {
    const composite = [
      `Skills: ${profile.skills.join(', ')}`,
      `Experience: ${profile.experience.join('. ')}`,
      `Education: ${profile.education.join('. ')}`,
      profile.careerGoals.targetRole
        ? `Target Role: ${profile.careerGoals.targetRole}`
        : '',
      profile.careerGoals.targetIndustry
        ? `Target Industries: ${profile.careerGoals.targetIndustry.join(', ')}`
        : '',
      `Remote Preference: ${profile.preferences.remotePreference}`,
      profile.preferences.preferredLocations.length > 0
        ? `Preferred Locations: ${profile.preferences.preferredLocations.join(', ')}`
        : '',
    ]
      .filter(Boolean)
      .join('\n');

    return this.generateEmbedding(composite);
  }

  private getFromCache(key: string): number[] | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.cacheTtlMs) {
      this.cache.delete(key);
      return null;
    }

    return entry.embedding;
  }

  private setCache(key: string, embedding: number[]): void {
    if (this.cache.size > 5000) {
      const oldest = this.cache.keys().next().value;
      if (oldest !== undefined) {
        this.cache.delete(oldest);
      }
    }
    this.cache.set(key, { embedding, timestamp: Date.now() });
  }

  /**
   * Deterministic mock embedding based on text content hash.
   * Produces a 1536-dimensional vector for development/testing.
   */
  private generateMockEmbedding(text: string): number[] {
    const dimensions = 1536;
    let seed = 0;
    for (let i = 0; i < text.length; i++) {
      seed = ((seed << 5) - seed + text.charCodeAt(i)) | 0;
    }

    const embedding: number[] = [];
    for (let i = 0; i < dimensions; i++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      embedding.push((seed / 0x7fffffff) * 2 - 1);
    }

    const magnitude = Math.sqrt(
      embedding.reduce((sum, val) => sum + val * val, 0),
    );
    return embedding.map((val) => val / magnitude);
  }
}
