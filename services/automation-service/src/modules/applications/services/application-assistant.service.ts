import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  ApplicationPrepParams,
  PreparedApplication,
  SkillMapping,
  InterviewPrepItem,
  ApplicationChecklistItem,
  TrackParams,
  TrackedApplication,
  ApplicationInsights,
  MatchLevel,
} from '../../../common/interfaces';

@Injectable()
export class ApplicationAssistantService {
  private readonly logger = new Logger(ApplicationAssistantService.name);
  private readonly applications = new Map<string, TrackedApplication[]>();

  async prepareApplication(
    params: ApplicationPrepParams,
  ): Promise<PreparedApplication> {
    this.logger.log(
      `Preparing application for ${params.jobTitle} at ${params.company}`,
    );

    const skillMapping = this.mapSkills(
      params.userSkills,
      params.jobRequirements,
    );
    const coverLetter = this.generateCoverLetter(params, skillMapping);
    const profileTweaks = this.suggestProfileTweaks(params, skillMapping);
    const interviewPrep = this.generateInterviewPrep(params);
    const applicationChecklist = this.buildChecklist(params);

    return {
      coverLetter,
      skillMapping,
      profileTweaks,
      interviewPrep,
      applicationChecklist,
    };
  }

  async trackApplication(params: TrackParams): Promise<TrackedApplication> {
    const application: TrackedApplication = {
      id: randomUUID(),
      userId: params.userId,
      jobTitle: params.jobTitle,
      company: params.company,
      status: params.status,
      appliedAt: new Date(),
      lastUpdated: new Date(),
      notes: params.notes ?? '',
    };

    const userApps = this.applications.get(params.userId) ?? [];
    userApps.push(application);
    this.applications.set(params.userId, userApps);

    this.logger.log(
      `Tracked application: ${params.jobTitle} at ${params.company} [${params.status}]`,
    );

    return application;
  }

  async getApplicationInsights(userId: string): Promise<ApplicationInsights> {
    const apps = this.applications.get(userId) ?? [];

    const statusBreakdown: Record<string, number> = {};
    for (const app of apps) {
      statusBreakdown[app.status] = (statusBreakdown[app.status] ?? 0) + 1;
    }

    const companyCounts = new Map<string, number>();
    for (const app of apps) {
      companyCounts.set(app.company, (companyCounts.get(app.company) ?? 0) + 1);
    }
    const topCompanies = [...companyCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name);

    const offerCount = apps.filter((a) => a.status === 'offer').length;
    const interviewCount = apps.filter(
      (a) => a.status === 'interviewing',
    ).length;
    const successRate =
      apps.length > 0
        ? Math.round(((offerCount + interviewCount) / apps.length) * 100)
        : 0;

    const oldestApp = apps.reduce<Date | null>((oldest, app) => {
      if (!oldest || app.appliedAt < oldest) return app.appliedAt;
      return oldest;
    }, null);

    const weeksSinceFirst = oldestApp
      ? Math.max(
          1,
          Math.ceil(
            (Date.now() - oldestApp.getTime()) / (7 * 24 * 60 * 60 * 1000),
          ),
        )
      : 1;

    const weeklyApplicationRate = Math.round(apps.length / weeksSinceFirst);

    const totalDays = apps.reduce((sum, app) => {
      return (
        sum +
        (app.lastUpdated.getTime() - app.appliedAt.getTime()) /
          (24 * 60 * 60 * 1000)
      );
    }, 0);
    const averageTimeInPipeline =
      apps.length > 0 ? Math.round(totalDays / apps.length) : 0;

    const recommendations = this.generateInsightRecommendations(
      apps,
      successRate,
      statusBreakdown,
    );

    return {
      totalApplications: apps.length,
      statusBreakdown,
      averageTimeInPipeline,
      topCompanies,
      successRate,
      weeklyApplicationRate,
      recommendations,
    };
  }

  private mapSkills(
    userSkills: string[],
    jobRequirements: string[],
  ): SkillMapping[] {
    const mappings: SkillMapping[] = [];

    for (const req of jobRequirements) {
      const reqLower = req.toLowerCase();
      let bestMatch: { skill: string; level: MatchLevel } | null = null;

      for (const skill of userSkills) {
        const skillLower = skill.toLowerCase();

        if (reqLower.includes(skillLower) || skillLower.includes(reqLower)) {
          bestMatch = { skill, level: 'strong' };
          break;
        }

        const reqWords = reqLower.split(/\s+/);
        const skillWords = skillLower.split(/\s+/);
        const overlap = reqWords.filter((w) => skillWords.includes(w));
        if (overlap.length > 0 && !bestMatch) {
          bestMatch = { skill, level: 'partial' };
        }
      }

      if (!bestMatch) {
        const transferable = this.findTransferableSkill(userSkills, req);
        if (transferable) {
          bestMatch = { skill: transferable, level: 'transferable' };
        }
      }

      if (bestMatch) {
        mappings.push({
          userSkill: bestMatch.skill,
          jobRequirement: req,
          matchLevel: bestMatch.level,
        });
      } else {
        mappings.push({
          userSkill: '(gap)',
          jobRequirement: req,
          matchLevel: 'transferable',
        });
      }
    }

    return mappings;
  }

  private findTransferableSkill(
    userSkills: string[],
    requirement: string,
  ): string | null {
    const transferMap: Record<string, string[]> = {
      leadership: ['management', 'team lead', 'mentoring', 'coordination'],
      communication: ['writing', 'presentation', 'public speaking', 'documentation'],
      programming: ['coding', 'software development', 'engineering'],
      data: ['analytics', 'statistics', 'research', 'analysis'],
      design: ['ui', 'ux', 'creative', 'visual'],
    };

    const reqLower = requirement.toLowerCase();

    for (const [category, related] of Object.entries(transferMap)) {
      if (
        reqLower.includes(category) ||
        related.some((r) => reqLower.includes(r))
      ) {
        const match = userSkills.find((skill) => {
          const sLower = skill.toLowerCase();
          return (
            sLower.includes(category) ||
            related.some((r) => sLower.includes(r))
          );
        });
        if (match) return match;
      }
    }

    return null;
  }

  private generateCoverLetter(
    params: ApplicationPrepParams,
    skillMapping: SkillMapping[],
  ): string {
    const strongMatches = skillMapping
      .filter((m) => m.matchLevel === 'strong')
      .map((m) => m.userSkill);
    const partialMatches = skillMapping
      .filter((m) => m.matchLevel === 'partial')
      .map((m) => m.userSkill);

    const skillHighlight =
      strongMatches.length > 0
        ? `My expertise in ${strongMatches.slice(0, 3).join(', ')} directly aligns with your requirements.`
        : partialMatches.length > 0
          ? `My background in ${partialMatches.slice(0, 3).join(', ')} provides a strong foundation for this role.`
          : 'I bring a diverse skill set that I am eager to apply to this role.';

    return [
      `Dear Hiring Manager,`,
      ``,
      `I am writing to express my strong interest in the ${params.jobTitle} position at ${params.company}. ${skillHighlight}`,
      ``,
      `${params.userSummary}`,
      ``,
      `In my experience, ${params.userExperience.slice(0, 200)}${params.userExperience.length > 200 ? '...' : ''} I have developed skills that are directly applicable to this role.`,
      ``,
      `I am particularly excited about the opportunity at ${params.company} because of the innovative work being done in this space. I am confident that my background and enthusiasm make me a strong fit for this position.`,
      ``,
      `I look forward to the opportunity to discuss how my experience and skills can contribute to the continued success of ${params.company}.`,
      ``,
      `Sincerely,`,
      `[Your Name]`,
    ].join('\n');
  }

  private suggestProfileTweaks(
    params: ApplicationPrepParams,
    skillMapping: SkillMapping[],
  ): string[] {
    const tweaks: string[] = [];

    const gaps = skillMapping.filter(
      (m) => m.matchLevel === 'transferable' && m.userSkill === '(gap)',
    );
    if (gaps.length > 0) {
      tweaks.push(
        `Consider adding experience related to: ${gaps.map((g) => g.jobRequirement).join(', ')}`,
      );
    }

    tweaks.push(
      `Update your headline to mention "${params.jobTitle}" or related keywords`,
    );
    tweaks.push(
      `Add "${params.company}" industry-related keywords to your summary`,
    );

    const strongSkills = skillMapping
      .filter((m) => m.matchLevel === 'strong')
      .map((m) => m.userSkill);
    if (strongSkills.length > 0) {
      tweaks.push(
        `Ensure ${strongSkills.join(', ')} are prominently featured in your skills section`,
      );
    }

    tweaks.push(
      'Add quantifiable achievements (numbers, percentages) to experience entries',
    );

    return tweaks;
  }

  private generateInterviewPrep(
    params: ApplicationPrepParams,
  ): InterviewPrepItem[] {
    return [
      {
        question: `Why do you want to work at ${params.company}?`,
        suggestedAnswer: `I'm drawn to ${params.company} because of its reputation for innovation in the industry. The ${params.jobTitle} role aligns perfectly with my career goals, and I'm excited about the opportunity to contribute my expertise in ${params.userSkills.slice(0, 2).join(' and ')}.`,
        tips: 'Research recent company news and mention specific projects or values that resonate with you.',
      },
      {
        question: `Tell me about your experience with ${params.jobRequirements[0] ?? 'the key requirements'}.`,
        suggestedAnswer: `In my previous roles, I have worked extensively with ${params.userSkills.slice(0, 3).join(', ')}. ${params.userExperience.slice(0, 150)}`,
        tips: 'Use the STAR method: Situation, Task, Action, Result. Quantify outcomes when possible.',
      },
      {
        question: 'Describe a challenging project and how you overcame it.',
        suggestedAnswer:
          'Draw from your experience to describe a specific project where you faced significant challenges. Focus on problem-solving approach and measurable outcomes.',
        tips: 'Pick a story that showcases skills relevant to this role. End with the positive impact.',
      },
      {
        question: `How do your skills in ${params.userSkills[0] ?? 'your domain'} apply to this role?`,
        suggestedAnswer: `My skills are directly applicable because ${params.jobDescription.slice(0, 100)} requires the exact expertise I've built over my career.`,
        tips: 'Map specific skills to specific job requirements. Show you understand their needs.',
      },
      {
        question: 'Where do you see yourself in 5 years?',
        suggestedAnswer: `I see myself growing within a company like ${params.company}, taking on increasing responsibility and contributing to strategic initiatives in the ${params.jobTitle} domain.`,
        tips: 'Show ambition while demonstrating loyalty and alignment with the company\'s trajectory.',
      },
    ];
  }

  private buildChecklist(
    params: ApplicationPrepParams,
  ): ApplicationChecklistItem[] {
    return [
      { item: 'Tailor resume to job description', completed: false },
      { item: 'Write customized cover letter', completed: true },
      { item: `Research ${params.company} recent news and culture`, completed: false },
      { item: 'Update LinkedIn profile with relevant keywords', completed: false },
      { item: 'Prepare portfolio/work samples if applicable', completed: false },
      { item: 'Review and practice interview questions', completed: false },
      { item: 'Set up job alert for similar roles', completed: false },
      { item: 'Identify potential referral connections', completed: false },
      { item: 'Submit application before deadline', completed: false },
      { item: 'Schedule follow-up reminder for 1 week after submission', completed: false },
    ];
  }

  private generateInsightRecommendations(
    apps: TrackedApplication[],
    successRate: number,
    statusBreakdown: Record<string, number>,
  ): string[] {
    const recommendations: string[] = [];

    if (successRate < 20 && apps.length >= 5) {
      recommendations.push(
        'Your success rate is below 20%. Consider more targeted applications with tailored materials.',
      );
    }

    const rejections = statusBreakdown['rejected'] ?? 0;
    if (rejections > apps.length * 0.5 && apps.length >= 4) {
      recommendations.push(
        'High rejection rate detected. Review your resume and cover letter strategy.',
      );
    }

    const saved = statusBreakdown['saved'] ?? 0;
    if (saved > apps.length * 0.3) {
      recommendations.push(
        'Many saved applications not yet submitted. Set deadlines to move forward on promising opportunities.',
      );
    }

    if (apps.length < 3) {
      recommendations.push(
        'Increase your application volume. Aim for at least 5 applications per week.',
      );
    }

    recommendations.push(
      'Follow up on applications that have been in "applied" status for more than 7 days.',
    );

    return recommendations;
  }
}
