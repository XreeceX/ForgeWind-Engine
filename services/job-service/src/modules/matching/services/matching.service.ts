import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
  UserProfile,
  MatchedJob,
  MatchExplanation,
} from '../../../common/interfaces';
import { JobsService } from '../../jobs/services/jobs.service';
import { JobAggregatorService } from '../../jobs/services/job-aggregator.service';
import { EmbeddingService } from './embedding.service';
import { ScoringService } from './scoring.service';

@Injectable()
export class MatchingService {
  private readonly logger = new Logger(MatchingService.name);
  private readonly client: OpenAI | null;
  private readonly model: string;

  /**
   * In-memory profile store for development.
   * In production this would be backed by the user-service.
   */
  private readonly mockProfiles = new Map<string, UserProfile>();

  constructor(
    private readonly configService: ConfigService,
    private readonly jobsService: JobsService,
    private readonly aggregatorService: JobAggregatorService,
    private readonly embeddingService: EmbeddingService,
    private readonly scoringService: ScoringService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.model = this.configService.get<string>(
      'OPENAI_CHAT_MODEL',
      'gpt-4o-mini',
    );
    this.client = apiKey ? new OpenAI({ apiKey }) : null;

    this.seedMockProfile();
  }

  async findMatchesForUser(
    userId: string,
    limit = 10,
  ): Promise<MatchedJob[]> {
    const profile = this.getProfile(userId);
    const allJobs = await this.aggregatorService.aggregateJobs();

    const scoredJobs = await Promise.all(
      allJobs.map(async (job) => {
        const matchResult = await this.scoringService.calculateMatchScore(
          profile,
          job,
        );
        return { ...job, matchResult } satisfies MatchedJob;
      }),
    );

    return scoredJobs
      .sort((a, b) => b.matchResult.overallScore - a.matchResult.overallScore)
      .slice(0, limit);
  }

  async explainMatch(
    userId: string,
    jobId: string,
  ): Promise<MatchExplanation> {
    const profile = this.getProfile(userId);
    const job = await this.jobsService.findById(jobId);
    if (!job) {
      throw new NotFoundException(`Job "${jobId}" not found`);
    }

    const matchResult = await this.scoringService.calculateMatchScore(
      profile,
      job,
    );

    if (this.client) {
      return this.generateLLMExplanation(profile, job, matchResult);
    }

    return this.generateHeuristicExplanation(profile, job, matchResult);
  }

  async scoreForPair(
    profile: UserProfile,
    jobId: string,
  ): Promise<MatchedJob> {
    const job = await this.jobsService.findById(jobId);
    if (!job) {
      throw new NotFoundException(`Job "${jobId}" not found`);
    }

    const matchResult = await this.scoringService.calculateMatchScore(
      profile,
      job,
    );
    return { ...job, matchResult };
  }

  private getProfile(userId: string): UserProfile {
    const profile = this.mockProfiles.get(userId);
    if (!profile) {
      throw new NotFoundException(
        `User profile for "${userId}" not found. In production, this would fetch from user-service.`,
      );
    }
    return profile;
  }

  private async generateLLMExplanation(
    profile: UserProfile,
    job: { title: string; company: string; description: string; skills: string[]; requirements: string[] },
    matchResult: { overallScore: number; breakdown: { category: string; score: number; reason: string }[]; pros: string[]; cons: string[] },
  ): Promise<MatchExplanation> {
    try {
      const prompt = [
        'Generate a detailed match explanation between this candidate and job.',
        'Return ONLY a JSON object with:',
        '  "summary": string (2-3 sentences),',
        '  "strengths": string[] (3-5 items),',
        '  "gaps": string[] (2-4 items),',
        '  "preparationTips": string[] (3-5 actionable tips)',
        '',
        `Match Score: ${matchResult.overallScore}/100`,
        `Breakdown: ${JSON.stringify(matchResult.breakdown)}`,
        '',
        `Candidate skills: ${profile.skills.join(', ')}`,
        `Candidate experience: ${profile.experience.join('; ')}`,
        '',
        `Job: ${job.title} at ${job.company}`,
        `Description: ${job.description.slice(0, 600)}`,
        `Required skills: ${job.skills.join(', ')}`,
        `Requirements: ${job.requirements.join('; ')}`,
      ].join('\n');

      const response = await this.client!.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.4,
        max_tokens: 600,
      });

      const content = response.choices[0]?.message.content;
      if (content) {
        const parsed = JSON.parse(content) as MatchExplanation;
        return {
          summary: parsed.summary,
          strengths: parsed.strengths,
          gaps: parsed.gaps,
          preparationTips: parsed.preparationTips,
        };
      }
    } catch (err) {
      this.logger.error(
        `LLM explanation failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    return this.generateHeuristicExplanation(profile, job, matchResult);
  }

  private generateHeuristicExplanation(
    profile: UserProfile,
    job: { title: string; company: string; skills: string[] },
    matchResult: { overallScore: number; pros: string[]; cons: string[] },
  ): MatchExplanation {
    const userSkillsLower = new Set(
      profile.skills.map((s) => s.toLowerCase()),
    );
    const matchedSkills = job.skills.filter((s) =>
      userSkillsLower.has(s.toLowerCase()),
    );
    const missingSkills = job.skills.filter(
      (s) => !userSkillsLower.has(s.toLowerCase()),
    );

    const summary = `Your profile has a ${matchResult.overallScore}% match with ${job.title} at ${job.company}. You match ${matchedSkills.length} of ${job.skills.length} required skills.`;

    const strengths = [
      ...matchResult.pros,
      ...(matchedSkills.length > 0
        ? [`Strong in: ${matchedSkills.join(', ')}`]
        : []),
    ];

    const gaps = [
      ...matchResult.cons,
      ...(missingSkills.length > 0
        ? [`Missing skills: ${missingSkills.join(', ')}`]
        : []),
    ];

    const preparationTips: string[] = [];
    if (missingSkills.length > 0) {
      preparationTips.push(
        `Build proficiency in ${missingSkills.slice(0, 2).join(' and ')} through projects or courses`,
      );
    }
    preparationTips.push(
      'Tailor your resume to highlight relevant experience for this role',
      'Research the company culture and recent news before applying',
      'Prepare specific examples demonstrating your relevant skills',
    );

    return {
      summary,
      strengths: strengths.length > 0 ? strengths : ['Profile loaded — scoring in progress'],
      gaps: gaps.length > 0 ? gaps : ['No significant gaps detected'],
      preparationTips,
    };
  }

  private seedMockProfile(): void {
    this.mockProfiles.set('user_demo', {
      id: 'user_demo',
      skills: [
        'TypeScript',
        'React',
        'Node.js',
        'Python',
        'PostgreSQL',
        'Docker',
        'AWS',
        'GraphQL',
      ],
      experience: [
        'Senior Frontend Developer at WebAgency (3 years) — Built React apps, design systems, mentored juniors',
        'Full Stack Developer at StartupCo (2 years) — Node.js APIs, PostgreSQL, Docker deployments',
        'Junior Developer at DevShop (1 year) — HTML/CSS/JS, jQuery, responsive design',
      ],
      education: [
        'B.S. Computer Science, State University (2018)',
      ],
      careerGoals: {
        targetRole: 'Senior Frontend Engineer',
        targetIndustry: ['Technology', 'SaaS'],
        targetCompanies: ['TechCorp', 'Google', 'Stripe'],
        salaryRange: { min: 160000, max: 250000, currency: 'USD' },
        willingToRelocate: false,
        remotePreference: 'REMOTE' as const,
      },
      preferences: {
        preferredLocations: ['San Francisco, CA', 'New York, NY'],
        remotePreference: 'REMOTE' as const,
        preferredCompanySize: ['MEDIUM' as const, 'LARGE' as const],
        preferredIndustries: ['Technology', 'SaaS'],
        minimumSalary: 150000,
        willingToRelocate: false,
      },
    });
  }
}
