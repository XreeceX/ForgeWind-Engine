import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Job, JobType, ExperienceLevel } from '../../../common/interfaces';

export interface JobSource {
  readonly name: string;
  fetchJobs(): Promise<Record<string, unknown>[]>;
}

@Injectable()
export class JobAggregatorService implements OnModuleInit {
  private readonly logger = new Logger(JobAggregatorService.name);
  private readonly sources: JobSource[] = [];

  onModuleInit(): void {
    this.registerSource(new MockJobSource());
    this.logger.log(
      `Initialized with ${this.sources.length} job source(s)`,
    );
  }

  registerSource(source: JobSource): void {
    this.sources.push(source);
    this.logger.log(`Registered job source: ${source.name}`);
  }

  async aggregateJobs(): Promise<Job[]> {
    const allJobs: Job[] = [];

    const results = await Promise.allSettled(
      this.sources.map(async (source) => {
        this.logger.log(`Fetching from source: ${source.name}`);
        const rawJobs = await source.fetchJobs();
        return rawJobs.map((raw) => this.normalizeJob(raw, source.name));
      }),
    );

    for (const result of results) {
      if (result.status === 'fulfilled') {
        allJobs.push(...result.value);
      } else {
        this.logger.error(
          `Failed to fetch from source: ${String(result.reason)}`,
        );
      }
    }

    this.logger.log(`Aggregated ${allJobs.length} jobs from ${this.sources.length} source(s)`);
    return allJobs;
  }

  normalizeJob(rawJob: Record<string, unknown>, source: string): Job {
    const getString = (key: string, fallback = ''): string => {
      const val = rawJob[key];
      return typeof val === 'string' ? val : fallback;
    };

    const getArray = (key: string): string[] => {
      const val = rawJob[key];
      return Array.isArray(val)
        ? val.filter((v): v is string => typeof v === 'string')
        : [];
    };

    const getEnum = <T extends Record<string, string>>(
      key: string,
      enumObj: T,
      fallback: T[keyof T],
    ): T[keyof T] => {
      const val = rawJob[key];
      if (typeof val === 'string' && Object.values(enumObj).includes(val)) {
        return val as T[keyof T];
      }
      return fallback;
    };

    const parseSalary = (): Job['salaryRange'] => {
      const salary = rawJob['salary'] ?? rawJob['salaryRange'];
      if (
        salary !== null &&
        salary !== undefined &&
        typeof salary === 'object' &&
        !Array.isArray(salary)
      ) {
        const s = salary as Record<string, unknown>;
        const min = typeof s['min'] === 'number' ? s['min'] : 0;
        const max = typeof s['max'] === 'number' ? s['max'] : 0;
        const currency =
          typeof s['currency'] === 'string' ? s['currency'] : 'USD';
        if (min > 0 || max > 0) {
          return { min, max, currency };
        }
      }
      return null;
    };

    const rawDate = rawJob['postedAt'] ?? rawJob['posted_at'] ?? rawJob['date'];
    let postedAt: Date;
    if (rawDate instanceof Date) {
      postedAt = rawDate;
    } else if (typeof rawDate === 'string') {
      postedAt = new Date(rawDate);
      if (isNaN(postedAt.getTime())) {
        postedAt = new Date();
      }
    } else {
      postedAt = new Date();
    }

    return {
      id: getString('id', `${source}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`),
      title: getString('title', 'Untitled Position'),
      company: getString('company', 'Unknown Company'),
      location: getString('location', 'Unknown'),
      remote: rawJob['remote'] === true,
      description: getString('description'),
      requirements: getArray('requirements'),
      skills: getArray('skills'),
      salaryRange: parseSalary(),
      jobType: getEnum('jobType', JobType, JobType.FULL_TIME),
      experienceLevel: getEnum('experienceLevel', ExperienceLevel, ExperienceLevel.MID),
      source,
      sourceUrl: getString('sourceUrl') || getString('url'),
      postedAt,
    };
  }
}

class MockJobSource implements JobSource {
  readonly name = 'mock-development';

  async fetchJobs(): Promise<Record<string, unknown>[]> {
    return [
      {
        id: 'mock_001',
        title: 'Senior Frontend Engineer',
        company: 'TechCorp',
        location: 'San Francisco, CA',
        remote: true,
        description:
          'We are looking for a senior frontend engineer to lead our design system and build scalable web applications using React and TypeScript.',
        requirements: [
          '5+ years of frontend development',
          'Expert React & TypeScript skills',
          'Experience with design systems',
          'Strong communication skills',
        ],
        skills: ['React', 'TypeScript', 'CSS', 'Design Systems', 'GraphQL'],
        salary: { min: 180000, max: 240000, currency: 'USD' },
        jobType: JobType.FULL_TIME,
        experienceLevel: ExperienceLevel.SENIOR,
        sourceUrl: 'https://example.com/jobs/mock_001',
        postedAt: new Date().toISOString(),
      },
      {
        id: 'mock_002',
        title: 'Full Stack Developer',
        company: 'StartupXYZ',
        location: 'New York, NY',
        remote: true,
        description:
          'Join our fast-growing startup as a full stack developer. You will work on both frontend and backend features using modern technologies.',
        requirements: [
          '3+ years full stack experience',
          'Node.js & React proficiency',
          'Database design experience',
          'Startup mindset',
        ],
        skills: ['Node.js', 'React', 'PostgreSQL', 'Docker', 'AWS'],
        salary: { min: 140000, max: 180000, currency: 'USD' },
        jobType: JobType.FULL_TIME,
        experienceLevel: ExperienceLevel.MID,
        sourceUrl: 'https://example.com/jobs/mock_002',
        postedAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'mock_003',
        title: 'DevOps Engineer',
        company: 'CloudScale Inc',
        location: 'Austin, TX',
        remote: false,
        description:
          'Looking for a DevOps engineer to build and maintain our cloud infrastructure on AWS with a focus on reliability and automation.',
        requirements: [
          '4+ years DevOps/SRE experience',
          'AWS certification preferred',
          'Terraform & Kubernetes expertise',
          'CI/CD pipeline experience',
        ],
        skills: ['AWS', 'Terraform', 'Kubernetes', 'Docker', 'CI/CD', 'Python'],
        salary: { min: 150000, max: 200000, currency: 'USD' },
        jobType: JobType.FULL_TIME,
        experienceLevel: ExperienceLevel.SENIOR,
        sourceUrl: 'https://example.com/jobs/mock_003',
        postedAt: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        id: 'mock_004',
        title: 'Machine Learning Engineer',
        company: 'AI Solutions',
        location: 'Seattle, WA',
        remote: true,
        description:
          'Build and deploy ML models that power our core products. Work with large-scale data pipelines and serve models in production.',
        requirements: [
          'MS/PhD in CS or related field',
          '3+ years ML engineering experience',
          'PyTorch or TensorFlow expertise',
          'Production ML system experience',
        ],
        skills: ['Python', 'PyTorch', 'TensorFlow', 'MLOps', 'SQL', 'Docker'],
        salary: { min: 170000, max: 250000, currency: 'USD' },
        jobType: JobType.FULL_TIME,
        experienceLevel: ExperienceLevel.SENIOR,
        sourceUrl: 'https://example.com/jobs/mock_004',
        postedAt: new Date(Date.now() - 259200000).toISOString(),
      },
      {
        id: 'mock_005',
        title: 'Product Design Intern',
        company: 'DesignHub',
        location: 'Remote',
        remote: true,
        description:
          'Summer internship opportunity for aspiring product designers. Work on real projects with mentorship from senior designers.',
        requirements: [
          'Currently enrolled in design program',
          'Figma proficiency',
          'Strong portfolio',
          'User research interest',
        ],
        skills: ['Figma', 'User Research', 'Prototyping', 'UI Design'],
        salary: { min: 60000, max: 75000, currency: 'USD' },
        jobType: JobType.INTERNSHIP,
        experienceLevel: ExperienceLevel.ENTRY,
        sourceUrl: 'https://example.com/jobs/mock_005',
        postedAt: new Date(Date.now() - 345600000).toISOString(),
      },
    ];
  }
}
