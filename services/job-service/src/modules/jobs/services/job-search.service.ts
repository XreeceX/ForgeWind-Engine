import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pinecone } from '@pinecone-database/pinecone';
import {
  Job,
  PaginatedResult,
  JobSearchQuery,
  JobFilters,
} from '../../../common/interfaces';
import { JobAggregatorService } from './job-aggregator.service';

@Injectable()
export class JobSearchService {
  private readonly logger = new Logger(JobSearchService.name);
  private pinecone: Pinecone | null = null;
  private readonly indexName: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly aggregatorService: JobAggregatorService,
  ) {
    this.indexName = this.configService.get<string>(
      'PINECONE_INDEX',
      'job-embeddings',
    );
    this.initPinecone();
  }

  private initPinecone(): void {
    const apiKey = this.configService.get<string>('PINECONE_API_KEY');
    if (apiKey) {
      this.pinecone = new Pinecone({ apiKey });
      this.logger.log('Pinecone client initialized');
    } else {
      this.logger.warn(
        'PINECONE_API_KEY not configured — vector search unavailable',
      );
    }
  }

  async search(query: JobSearchQuery): Promise<PaginatedResult<Job>> {
    const allJobs = await this.aggregatorService.aggregateJobs();
    const filtered = this.applyFilters(allJobs, query);

    const scored = query.query
      ? this.rankByTextRelevance(filtered, query.query)
      : filtered;

    const total = scored.length;
    const totalPages = Math.ceil(total / query.limit) || 1;
    const start = (query.page - 1) * query.limit;
    const items = scored.slice(start, start + query.limit);

    return {
      items,
      total,
      page: query.page,
      limit: query.limit,
      totalPages,
    };
  }

  async searchSemantic(
    embedding: number[],
    filters?: JobFilters,
  ): Promise<Job[]> {
    if (!this.pinecone) {
      this.logger.warn(
        'Vector search requested but Pinecone not configured — falling back to aggregated jobs',
      );
      const allJobs = await this.aggregatorService.aggregateJobs();
      return filters ? this.applyJobFilters(allJobs, filters) : allJobs;
    }

    const index = this.pinecone.index(this.indexName);

    const pineconeFilter: Record<string, unknown> = {};
    if (filters?.jobType) {
      pineconeFilter['jobType'] = { $eq: filters.jobType };
    }
    if (filters?.experienceLevel) {
      pineconeFilter['experienceLevel'] = { $eq: filters.experienceLevel };
    }
    if (filters?.location) {
      pineconeFilter['location'] = { $eq: filters.location };
    }
    if (filters?.postedAfter) {
      pineconeFilter['postedAt'] = {
        $gte: filters.postedAfter.toISOString(),
      };
    }

    const queryResult = await index.query({
      vector: embedding,
      topK: 20,
      includeMetadata: true,
      filter: Object.keys(pineconeFilter).length > 0 ? pineconeFilter : undefined,
    });

    return (queryResult.matches ?? []).map((match) => {
      const meta = (match.metadata ?? {}) as Record<string, unknown>;
      return this.metadataToJob(match.id, meta, match.score ?? 0);
    });
  }

  private applyFilters(jobs: Job[], query: JobSearchQuery): Job[] {
    return jobs.filter((job) => {
      if (query.jobType && job.jobType !== query.jobType) return false;
      if (
        query.experienceLevel &&
        job.experienceLevel !== query.experienceLevel
      )
        return false;
      if (query.remote !== undefined && job.remote !== query.remote)
        return false;
      if (
        query.location &&
        !job.location.toLowerCase().includes(query.location.toLowerCase())
      )
        return false;
      if (query.salaryMin && job.salaryRange && job.salaryRange.max < query.salaryMin)
        return false;
      if (query.salaryMax && job.salaryRange && job.salaryRange.min > query.salaryMax)
        return false;
      return true;
    });
  }

  private applyJobFilters(jobs: Job[], filters: JobFilters): Job[] {
    return jobs.filter((job) => {
      if (filters.jobType && job.jobType !== filters.jobType) return false;
      if (
        filters.experienceLevel &&
        job.experienceLevel !== filters.experienceLevel
      )
        return false;
      if (
        filters.location &&
        !job.location.toLowerCase().includes(filters.location.toLowerCase())
      )
        return false;
      if (filters.postedAfter && job.postedAt < filters.postedAfter)
        return false;
      return true;
    });
  }

  private rankByTextRelevance(jobs: Job[], query: string): Job[] {
    const terms = query.toLowerCase().split(/\s+/);

    const scored = jobs.map((job) => {
      let score = 0;
      const searchable = [
        job.title,
        job.company,
        job.description,
        ...job.skills,
        ...job.requirements,
      ]
        .join(' ')
        .toLowerCase();

      for (const term of terms) {
        if (job.title.toLowerCase().includes(term)) score += 10;
        if (job.skills.some((s) => s.toLowerCase().includes(term))) score += 8;
        if (job.company.toLowerCase().includes(term)) score += 5;
        if (searchable.includes(term)) score += 2;
      }

      return { job, score };
    });

    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((s) => s.job);
  }

  private metadataToJob(
    id: string,
    meta: Record<string, unknown>,
    _score: number,
  ): Job {
    return this.aggregatorService.normalizeJob({ id, ...meta }, 'pinecone');
  }
}
