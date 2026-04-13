import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  Job,
  PaginatedResult,
  JobSearchQuery,
  MarketTrends,
} from '../../../common/interfaces';
import { CreateJobDto } from '../../../common/dto';
import { JobSearchService } from './job-search.service';
import { JobAggregatorService } from './job-aggregator.service';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);
  private readonly manualJobs: Map<string, Job> = new Map();

  constructor(
    private readonly searchService: JobSearchService,
    private readonly aggregatorService: JobAggregatorService,
  ) {}

  async findAll(query: JobSearchQuery): Promise<PaginatedResult<Job>> {
    const result = await this.searchService.search(query);

    const manualMatches = this.filterManualJobs(query);
    if (manualMatches.length > 0) {
      const combined = [...manualMatches, ...result.items];
      const total = result.total + manualMatches.length;
      return {
        items: combined.slice(0, query.limit),
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit) || 1,
      };
    }

    return result;
  }

  async findById(id: string): Promise<Job | null> {
    const manual = this.manualJobs.get(id);
    if (manual) return manual;

    const allJobs = await this.aggregatorService.aggregateJobs();
    return allJobs.find((job) => job.id === id) ?? null;
  }

  async create(dto: CreateJobDto): Promise<Job> {
    const job: Job = {
      id: `manual_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      title: dto.title,
      company: dto.company,
      location: dto.location,
      remote: dto.remote,
      description: dto.description,
      requirements: dto.requirements,
      skills: dto.skills,
      salaryRange: dto.salaryRange ?? null,
      jobType: dto.jobType,
      experienceLevel: dto.experienceLevel,
      source: dto.source,
      sourceUrl: dto.sourceUrl,
      postedAt: new Date(),
    };

    this.manualJobs.set(job.id, job);
    this.logger.log(`Manually created job: ${job.id} — ${job.title} at ${job.company}`);
    return job;
  }

  async getMarketTrends(): Promise<MarketTrends> {
    const allJobs = await this.aggregatorService.aggregateJobs();
    return this.computeTrends(allJobs);
  }

  async getById(id: string): Promise<Job> {
    const job = await this.findById(id);
    if (!job) {
      throw new NotFoundException(`Job with ID "${id}" not found`);
    }
    return job;
  }

  private filterManualJobs(query: JobSearchQuery): Job[] {
    const jobs = Array.from(this.manualJobs.values());
    return jobs.filter((job) => {
      if (query.jobType && job.jobType !== query.jobType) return false;
      if (query.experienceLevel && job.experienceLevel !== query.experienceLevel)
        return false;
      if (query.remote !== undefined && job.remote !== query.remote) return false;
      if (
        query.location &&
        !job.location.toLowerCase().includes(query.location.toLowerCase())
      )
        return false;
      if (
        query.query &&
        !`${job.title} ${job.company} ${job.description}`
          .toLowerCase()
          .includes(query.query.toLowerCase())
      )
        return false;
      return true;
    });
  }

  private computeTrends(jobs: Job[]): MarketTrends {
    const skillCount = new Map<string, number>();
    const companyCount = new Map<string, number>();
    const roleCount = new Map<string, number>();
    const salaryByRole = new Map<string, number[]>();

    for (const job of jobs) {
      for (const skill of job.skills) {
        skillCount.set(skill, (skillCount.get(skill) ?? 0) + 1);
      }

      companyCount.set(job.company, (companyCount.get(job.company) ?? 0) + 1);
      roleCount.set(job.title, (roleCount.get(job.title) ?? 0) + 1);

      if (job.salaryRange) {
        const existing = salaryByRole.get(job.title) ?? [];
        existing.push(job.salaryRange.min, job.salaryRange.max);
        salaryByRole.set(job.title, existing);
      }
    }

    const topSkills = [...skillCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([skill, demand]) => ({ skill, demand }));

    const topRoles = [...roleCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([role]) => role);

    const topCompanies = [...companyCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([company]) => company);

    const salaryTrends: MarketTrends['salaryTrends'] = {};
    for (const [role, salaries] of salaryByRole) {
      const sorted = [...salaries].sort((a, b) => a - b);
      salaryTrends[role] = {
        min: sorted[0] ?? 0,
        max: sorted[sorted.length - 1] ?? 0,
        median: sorted[Math.floor(sorted.length / 2)] ?? 0,
      };
    }

    const emergingTech = topSkills
      .filter((s) =>
        ['AI', 'ML', 'LLM', 'Rust', 'WebAssembly', 'MLOps', 'GenAI'].some(
          (tech) => s.skill.toLowerCase().includes(tech.toLowerCase()),
        ),
      )
      .map((s) => s.skill);

    const remoteCount = jobs.filter((j) => j.remote).length;
    const remotePercentage = jobs.length > 0
      ? Math.round((remoteCount / jobs.length) * 100)
      : 0;

    const marketInsights = [
      `${jobs.length} active job listings across ${companyCount.size} companies`,
      `${remotePercentage}% of positions offer remote work`,
      `Most in-demand skill: ${topSkills[0]?.skill ?? 'N/A'} (${topSkills[0]?.demand ?? 0} listings)`,
      `Top hiring company: ${topCompanies[0] ?? 'N/A'}`,
    ];

    return {
      topSkills,
      topRoles,
      topCompanies,
      salaryTrends,
      emergingTechnologies: emergingTech,
      marketInsights,
    };
  }
}
