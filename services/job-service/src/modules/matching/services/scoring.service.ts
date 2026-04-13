import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { Job, UserProfile, MatchResult } from '../../../common/interfaces';

interface WeightedScore {
  category: string;
  weight: number;
  score: number;
  reason: string;
}

const SCORE_WEIGHTS = {
  skills: 0.4,
  experience: 0.25,
  location: 0.15,
  salary: 0.1,
  culture: 0.1,
} as const;

@Injectable()
export class ScoringService {
  private readonly logger = new Logger(ScoringService.name);
  private readonly client: OpenAI | null;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.model = this.configService.get<string>(
      'OPENAI_CHAT_MODEL',
      'gpt-4o-mini',
    );

    if (apiKey) {
      this.client = new OpenAI({ apiKey });
    } else {
      this.client = null;
      this.logger.warn(
        'OPENAI_API_KEY not configured — culture/experience scoring will use heuristics',
      );
    }
  }

  async calculateMatchScore(
    userProfile: UserProfile,
    job: Job,
  ): Promise<MatchResult> {
    const [skillScore, experienceScore, locationScore, salaryScore, cultureScore] =
      await Promise.all([
        this.scoreSkills(userProfile, job),
        this.scoreExperience(userProfile, job),
        Promise.resolve(this.scoreLocation(userProfile, job)),
        Promise.resolve(this.scoreSalary(userProfile, job)),
        this.scoreCulture(userProfile, job),
      ]);

    const scores: WeightedScore[] = [
      skillScore,
      experienceScore,
      locationScore,
      salaryScore,
      cultureScore,
    ];

    const overallScore = Math.round(
      scores.reduce((sum, s) => sum + s.score * s.weight, 0),
    );

    const pros: string[] = [];
    const cons: string[] = [];
    for (const s of scores) {
      if (s.score >= 70) {
        pros.push(s.reason);
      } else if (s.score < 50) {
        cons.push(s.reason);
      }
    }

    return {
      overallScore: clamp(overallScore, 0, 100),
      skillMatch: skillScore.score,
      experienceMatch: experienceScore.score,
      locationMatch: locationScore.score,
      salaryMatch: salaryScore.score,
      cultureFit: cultureScore.score,
      breakdown: scores.map((s) => ({
        category: s.category,
        score: s.score,
        reason: s.reason,
      })),
      pros,
      cons,
    };
  }

  private async scoreSkills(
    profile: UserProfile,
    job: Job,
  ): Promise<WeightedScore> {
    const userSkills = new Set(
      profile.skills.map((s) => s.toLowerCase().trim()),
    );
    const jobSkills = job.skills.map((s) => s.toLowerCase().trim());

    if (jobSkills.length === 0) {
      return {
        category: 'Skills',
        weight: SCORE_WEIGHTS.skills,
        score: 50,
        reason: 'No specific skills listed for this position',
      };
    }

    const matched = jobSkills.filter((skill) => {
      for (const userSkill of userSkills) {
        if (
          userSkill === skill ||
          userSkill.includes(skill) ||
          skill.includes(userSkill)
        ) {
          return true;
        }
      }
      return false;
    });

    const score = Math.round((matched.length / jobSkills.length) * 100);
    const missing = jobSkills.filter((s) => !matched.includes(s));

    let reason: string;
    if (score >= 80) {
      reason = `Strong skill match — ${matched.length}/${jobSkills.length} required skills`;
    } else if (score >= 50) {
      reason = `Partial skill match — missing: ${missing.slice(0, 3).join(', ')}`;
    } else {
      reason = `Skill gap — missing ${missing.length}/${jobSkills.length} required skills`;
    }

    return {
      category: 'Skills',
      weight: SCORE_WEIGHTS.skills,
      score: clamp(score, 0, 100),
      reason,
    };
  }

  private async scoreExperience(
    profile: UserProfile,
    job: Job,
  ): Promise<WeightedScore> {
    if (this.client && profile.experience.length > 0) {
      return this.scoreExperienceWithLLM(profile, job);
    }
    return this.scoreExperienceHeuristic(profile, job);
  }

  private async scoreExperienceWithLLM(
    profile: UserProfile,
    job: Job,
  ): Promise<WeightedScore> {
    try {
      const prompt = [
        'Rate how well this candidate\'s experience matches the job on a scale of 0-100.',
        'Return ONLY a JSON object with "score" (number) and "reason" (string, 1 sentence).',
        '',
        `Candidate experience:\n${profile.experience.join('\n')}`,
        `Candidate education:\n${profile.education.join('\n')}`,
        '',
        `Job: ${job.title} at ${job.company}`,
        `Level: ${job.experienceLevel}`,
        `Requirements:\n${job.requirements.join('\n')}`,
      ].join('\n');

      const response = await this.client!.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 200,
      });

      const content = response.choices[0]?.message.content;
      if (content) {
        const parsed = JSON.parse(content) as { score: number; reason: string };
        return {
          category: 'Experience',
          weight: SCORE_WEIGHTS.experience,
          score: clamp(Math.round(parsed.score), 0, 100),
          reason: parsed.reason,
        };
      }
    } catch (err) {
      this.logger.error(
        `LLM experience scoring failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    return this.scoreExperienceHeuristic(profile, job);
  }

  private scoreExperienceHeuristic(
    profile: UserProfile,
    job: Job,
  ): WeightedScore {
    const expText = profile.experience.join(' ').toLowerCase();
    const reqText = job.requirements.join(' ').toLowerCase();

    const keywords = reqText
      .split(/[\s,;.]+/)
      .filter((w) => w.length > 3);
    const matchCount = keywords.filter((kw) => expText.includes(kw)).length;
    const matchRatio = keywords.length > 0 ? matchCount / keywords.length : 0;

    let baseScore = Math.round(matchRatio * 100);

    if (profile.experience.length === 0) {
      baseScore = Math.min(baseScore, 20);
    }

    const score = clamp(baseScore, 0, 100);
    const reason =
      score >= 70
        ? 'Relevant experience aligns well with role requirements'
        : score >= 40
          ? 'Some experience overlap, but gaps exist'
          : 'Limited experience match for this role';

    return {
      category: 'Experience',
      weight: SCORE_WEIGHTS.experience,
      score,
      reason,
    };
  }

  private scoreLocation(profile: UserProfile, job: Job): WeightedScore {
    const prefs = profile.preferences;

    if (job.remote && prefs.remotePreference === 'REMOTE') {
      return {
        category: 'Location',
        weight: SCORE_WEIGHTS.location,
        score: 100,
        reason: 'Remote position matches your remote preference',
      };
    }

    if (prefs.remotePreference === 'ANY') {
      return {
        category: 'Location',
        weight: SCORE_WEIGHTS.location,
        score: 90,
        reason: 'Flexible location preference — fits any arrangement',
      };
    }

    if (job.remote && prefs.remotePreference === 'HYBRID') {
      return {
        category: 'Location',
        weight: SCORE_WEIGHTS.location,
        score: 80,
        reason: 'Remote position works for hybrid preference',
      };
    }

    const jobLoc = job.location.toLowerCase();
    const locationMatch = prefs.preferredLocations.some((loc) =>
      jobLoc.includes(loc.toLowerCase()),
    );

    if (locationMatch) {
      return {
        category: 'Location',
        weight: SCORE_WEIGHTS.location,
        score: 95,
        reason: `Job location matches your preferred location`,
      };
    }

    if (prefs.willingToRelocate) {
      return {
        category: 'Location',
        weight: SCORE_WEIGHTS.location,
        score: 60,
        reason: 'Would require relocation, but you are open to it',
      };
    }

    return {
      category: 'Location',
      weight: SCORE_WEIGHTS.location,
      score: 20,
      reason: `Location mismatch — job is in ${job.location}`,
    };
  }

  private scoreSalary(profile: UserProfile, job: Job): WeightedScore {
    const goals = profile.careerGoals;

    if (!job.salaryRange) {
      return {
        category: 'Salary',
        weight: SCORE_WEIGHTS.salary,
        score: 50,
        reason: 'Salary not disclosed for this position',
      };
    }

    if (!goals.salaryRange && !profile.preferences.minimumSalary) {
      return {
        category: 'Salary',
        weight: SCORE_WEIGHTS.salary,
        score: 70,
        reason: 'No salary preference set — range appears competitive',
      };
    }

    const minDesired =
      profile.preferences.minimumSalary ?? goals.salaryRange?.min ?? 0;
    const maxDesired = goals.salaryRange?.max ?? Infinity;

    if (job.salaryRange.max >= minDesired && job.salaryRange.min <= maxDesired) {
      const midJob = (job.salaryRange.min + job.salaryRange.max) / 2;
      const midDesired = (minDesired + (maxDesired === Infinity ? midJob * 2 : maxDesired)) / 2;
      const ratio = midJob / midDesired;
      const score = clamp(Math.round(ratio * 100), 50, 100);
      return {
        category: 'Salary',
        weight: SCORE_WEIGHTS.salary,
        score,
        reason: `Salary range aligns well ($${job.salaryRange.min.toLocaleString()}-$${job.salaryRange.max.toLocaleString()})`,
      };
    }

    if (job.salaryRange.max < minDesired) {
      const gap = ((minDesired - job.salaryRange.max) / minDesired) * 100;
      return {
        category: 'Salary',
        weight: SCORE_WEIGHTS.salary,
        score: clamp(Math.round(50 - gap), 0, 49),
        reason: `Below desired range by ~${Math.round(gap)}%`,
      };
    }

    return {
      category: 'Salary',
      weight: SCORE_WEIGHTS.salary,
      score: 85,
      reason: 'Salary exceeds your target range',
    };
  }

  private async scoreCulture(
    profile: UserProfile,
    job: Job,
  ): Promise<WeightedScore> {
    if (this.client) {
      return this.scoreCultureWithLLM(profile, job);
    }
    return this.scoreCultureHeuristic(profile, job);
  }

  private async scoreCultureWithLLM(
    profile: UserProfile,
    job: Job,
  ): Promise<WeightedScore> {
    try {
      const prompt = [
        'Rate the culture/company fit between this candidate and job on a scale of 0-100.',
        'Return ONLY a JSON object with "score" (number) and "reason" (string, 1 sentence).',
        '',
        `Candidate preferences:`,
        `  Industries: ${profile.preferences.preferredIndustries.join(', ') || 'none specified'}`,
        `  Company size preference: ${profile.preferences.preferredCompanySize.join(', ') || 'any'}`,
        `  Career goals: ${profile.careerGoals.targetRole ?? 'not specified'}`,
        `  Target companies: ${profile.careerGoals.targetCompanies?.join(', ') ?? 'none'}`,
        '',
        `Job: ${job.title} at ${job.company}`,
        `Description: ${job.description.slice(0, 500)}`,
      ].join('\n');

      const response = await this.client!.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 200,
      });

      const content = response.choices[0]?.message.content;
      if (content) {
        const parsed = JSON.parse(content) as { score: number; reason: string };
        return {
          category: 'Culture Fit',
          weight: SCORE_WEIGHTS.culture,
          score: clamp(Math.round(parsed.score), 0, 100),
          reason: parsed.reason,
        };
      }
    } catch (err) {
      this.logger.error(
        `LLM culture scoring failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    return this.scoreCultureHeuristic(profile, job);
  }

  private scoreCultureHeuristic(
    profile: UserProfile,
    job: Job,
  ): WeightedScore {
    let score = 50;

    if (profile.careerGoals.targetCompanies?.some(
      (c) => c.toLowerCase() === job.company.toLowerCase(),
    )) {
      score += 30;
    }

    if (profile.careerGoals.targetRole) {
      const titleLower = job.title.toLowerCase();
      const targetLower = profile.careerGoals.targetRole.toLowerCase();
      if (titleLower.includes(targetLower) || targetLower.includes(titleLower)) {
        score += 15;
      }
    }

    if (profile.careerGoals.targetIndustry && profile.careerGoals.targetIndustry.length > 0) {
      score += 5;
    }

    return {
      category: 'Culture Fit',
      weight: SCORE_WEIGHTS.culture,
      score: clamp(score, 0, 100),
      reason:
        score >= 70
          ? 'Good alignment with your career goals and preferences'
          : 'Limited information to assess culture fit',
    };
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
