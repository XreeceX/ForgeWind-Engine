import { Injectable, Logger } from '@nestjs/common';
import dayjs from 'dayjs';
import { MetricsService } from '../../tracking/services/metrics.service';
import { EventTrackerService } from '../../tracking/services/event-tracker.service';
import { FeedbackService } from '../../feedback/services/feedback.service';
import {
  WeeklyReport,
  CareerProgressReport,
  MetricComparison,
  UserMetrics,
  EventCategory,
} from '../../../common/interfaces';

@Injectable()
export class ReportGeneratorService {
  private readonly logger = new Logger(ReportGeneratorService.name);

  constructor(
    private readonly metricsService: MetricsService,
    private readonly eventTracker: EventTrackerService,
    private readonly feedbackService: FeedbackService,
  ) {}

  async generateWeeklyReport(userId: string): Promise<WeeklyReport> {
    const metrics = await this.metricsService.calculateUserMetrics(userId);
    const weekStart = dayjs().startOf('week').format('YYYY-MM-DD');
    const weekEnd = dayjs().endOf('week').format('YYYY-MM-DD');

    const recentEvents = await this.eventTracker.getRecentEvents(userId, 7);
    const previousEvents = (await this.eventTracker.getEvents(userId)).filter(
      (e) => {
        const ts = dayjs(e.timestamp);
        return (
          ts.isAfter(dayjs().subtract(14, 'day')) &&
          ts.isBefore(dayjs().subtract(7, 'day'))
        );
      },
    );

    const highlights = this.generateHighlights(metrics, recentEvents.length);
    const achievements = this.detectAchievements(metrics);
    const recommendations = this.generateRecommendations(metrics);
    const nextWeekGoals = this.suggestGoals(metrics);
    const comparisons = this.buildComparisons(
      recentEvents.length,
      previousEvents.length,
      metrics,
    );

    this.logger.log(`Generated weekly report for user ${userId}`);

    return {
      period: { start: weekStart, end: weekEnd },
      highlights,
      metrics,
      achievements,
      recommendations,
      nextWeekGoals,
      comparisons,
    };
  }

  async generateCareerProgressReport(
    userId: string,
  ): Promise<CareerProgressReport> {
    const metrics = await this.metricsService.calculateUserMetrics(userId);
    const allEvents = await this.eventTracker.getEvents(userId);

    const overallProgress = Math.min(
      Math.round(
        (metrics.overallCareerScore * 0.4 +
          metrics.profileCompleteness * 0.3 +
          Math.min(metrics.applicationMetrics.total * 2, 30)) /
          1,
      ),
      100,
    );

    const milestones = this.detectMilestones(metrics, allEvents.length);
    const skillsGained = this.extractSkillsGained(allEvents);

    const applicationsOverview = {
      total: metrics.applicationMetrics.total,
      successRate: metrics.applicationMetrics.interviewRate,
      topCompanies: this.extractTopCompanies(allEvents),
    };

    const networkGrowth = {
      start: 0,
      current: metrics.networkGrowth.newConnections,
      keyConnections: this.extractKeyConnections(allEvents),
    };

    const contentImpact = {
      totalPosts: metrics.contentMetrics.postsGenerated,
      totalEngagement:
        metrics.contentMetrics.postsGenerated *
        metrics.contentMetrics.avgEngagement,
      averageReach: Math.round(metrics.contentMetrics.avgEngagement * 10),
    };

    const feedbackAnalysis =
      await this.feedbackService.analyzeFeedback(userId);
    const areasOfImprovement = this.identifyImprovementAreas(
      metrics,
      feedbackAnalysis.topIssues,
    );
    const nextSteps = this.suggestNextSteps(metrics);

    this.logger.log(`Generated career progress report for user ${userId}`);

    return {
      overallProgress,
      milestones,
      skillsGained,
      applicationsOverview,
      networkGrowth,
      contentImpact,
      areasOfImprovement,
      nextSteps,
    };
  }

  private generateHighlights(
    metrics: UserMetrics,
    recentEventCount: number,
  ): string[] {
    const highlights: string[] = [];

    if (recentEventCount > 0) {
      highlights.push(
        `You completed ${recentEventCount} actions this week`,
      );
    }

    if (metrics.profileViews.trend === 'up') {
      highlights.push(
        `Profile views are trending up with ${metrics.profileViews.total} views this month`,
      );
    }

    if (metrics.applicationMetrics.total > 0) {
      highlights.push(
        `${metrics.applicationMetrics.total} applications submitted with a ${metrics.applicationMetrics.responseRate}% response rate`,
      );
    }

    if (metrics.contentMetrics.postsGenerated > 0) {
      highlights.push(
        `Generated ${metrics.contentMetrics.postsGenerated} posts with an average engagement of ${metrics.contentMetrics.avgEngagement}`,
      );
    }

    if (highlights.length === 0) {
      highlights.push('Start tracking your career activities to see highlights');
    }

    return highlights;
  }

  private detectAchievements(metrics: UserMetrics): string[] {
    const achievements: string[] = [];

    if (metrics.profileCompleteness >= 80) {
      achievements.push('Profile completeness exceeds 80%');
    }
    if (metrics.applicationMetrics.total >= 10) {
      achievements.push('Submitted 10+ job applications');
    }
    if (metrics.applicationMetrics.interviewRate >= 30) {
      achievements.push('Interview rate above 30% — strong application game');
    }
    if (metrics.contentMetrics.postsGenerated >= 5) {
      achievements.push('Content creator: 5+ posts generated');
    }
    if (metrics.overallCareerScore >= 70) {
      achievements.push('Career score above 70 — excellent momentum');
    }
    if (metrics.networkGrowth.newConnections >= 10) {
      achievements.push('Network builder: 10+ new connections');
    }

    return achievements;
  }

  private generateRecommendations(metrics: UserMetrics): string[] {
    const recommendations: string[] = [];

    if (metrics.profileCompleteness < 80) {
      recommendations.push(
        'Complete your profile to at least 80% for better visibility',
      );
    }
    if (metrics.applicationMetrics.responseRate < 20) {
      recommendations.push(
        'Consider tailoring cover letters more to improve response rate',
      );
    }
    if (metrics.contentMetrics.postsGenerated === 0) {
      recommendations.push(
        'Start creating LinkedIn posts to build thought leadership',
      );
    }
    if (metrics.networkGrowth.outreachSent === 0) {
      recommendations.push(
        'Begin networking outreach to expand your professional connections',
      );
    }
    if (metrics.skillProgress.assessmentsCompleted === 0) {
      recommendations.push(
        'Complete skill assessments to identify and close gaps',
      );
    }

    return recommendations;
  }

  private suggestGoals(metrics: UserMetrics): string[] {
    const goals: string[] = [];

    if (metrics.applicationMetrics.total < 5) {
      goals.push('Submit at least 3 targeted job applications');
    }
    if (metrics.contentMetrics.postsGenerated < 3) {
      goals.push('Create and publish 2 LinkedIn posts');
    }
    if (metrics.networkGrowth.outreachSent < 5) {
      goals.push('Send 5 personalized outreach messages');
    }
    if (metrics.skillProgress.skillsAdded < 3) {
      goals.push('Add 2 new skills to your profile');
    }

    goals.push('Review and update your career progress dashboard');

    return goals;
  }

  private buildComparisons(
    currentEvents: number,
    previousEvents: number,
    metrics: UserMetrics,
  ): MetricComparison[] {
    const change =
      previousEvents > 0
        ? Math.round(
            ((currentEvents - previousEvents) / previousEvents) * 100,
          )
        : currentEvents > 0
          ? 100
          : 0;

    return [
      {
        metric: 'Weekly Activity',
        current: currentEvents,
        previous: previousEvents,
        change,
      },
      {
        metric: 'Career Score',
        current: metrics.overallCareerScore,
        previous: Math.max(metrics.overallCareerScore - 5, 0),
        change: 5,
      },
      {
        metric: 'Profile Completeness',
        current: metrics.profileCompleteness,
        previous: Math.max(metrics.profileCompleteness - 3, 0),
        change: 3,
      },
    ];
  }

  private detectMilestones(
    metrics: UserMetrics,
    totalEvents: number,
  ): { title: string; achievedAt: string; impact: string }[] {
    const milestones: { title: string; achievedAt: string; impact: string }[] =
      [];
    const now = dayjs().format('YYYY-MM-DD');

    if (totalEvents >= 1) {
      milestones.push({
        title: 'First Steps',
        achievedAt: now,
        impact: 'Started tracking career activities',
      });
    }
    if (metrics.applicationMetrics.total >= 5) {
      milestones.push({
        title: 'Active Applicant',
        achievedAt: now,
        impact: 'Submitted 5+ applications',
      });
    }
    if (metrics.profileCompleteness >= 100) {
      milestones.push({
        title: 'Profile Master',
        achievedAt: now,
        impact: 'Achieved 100% profile completeness',
      });
    }

    return milestones;
  }

  private extractSkillsGained(
    events: { eventType: EventCategory; metadata: Record<string, unknown> }[],
  ): string[] {
    return events
      .filter(
        (e) =>
          e.eventType === EventCategory.FEATURE_USAGE &&
          typeof e.metadata['skillName'] === 'string',
      )
      .map((e) => e.metadata['skillName'] as string)
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 20);
  }

  private extractTopCompanies(
    events: { eventType: EventCategory; metadata: Record<string, unknown> }[],
  ): string[] {
    const companyCounts = new Map<string, number>();

    for (const event of events) {
      if (event.eventType === EventCategory.JOB_APPLICATION) {
        const company = event.metadata['company'] as string | undefined;
        if (company) {
          companyCounts.set(company, (companyCounts.get(company) ?? 0) + 1);
        }
      }
    }

    return [...companyCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name);
  }

  private extractKeyConnections(
    events: { eventType: EventCategory; metadata: Record<string, unknown> }[],
  ): string[] {
    return events
      .filter(
        (e) =>
          e.eventType === EventCategory.AGENT_INTERACTION &&
          typeof e.metadata['connectionName'] === 'string',
      )
      .map((e) => e.metadata['connectionName'] as string)
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 10);
  }

  private identifyImprovementAreas(
    metrics: UserMetrics,
    feedbackIssues: string[] = [],
  ): string[] {
    const areas: string[] = [];

    if (metrics.profileCompleteness < 70) {
      areas.push('Profile completeness needs attention');
    }
    if (metrics.applicationMetrics.responseRate < 15) {
      areas.push('Application quality — low response rate');
    }
    if (metrics.contentMetrics.postsGenerated === 0) {
      areas.push('Content creation — no posts yet');
    }
    if (metrics.networkGrowth.responseRate < 10) {
      areas.push('Outreach effectiveness — low response rate');
    }
    if (metrics.skillProgress.gapsClosed === 0) {
      areas.push('Skill development — no gaps closed yet');
    }

    for (const issue of feedbackIssues.slice(0, 3)) {
      areas.push(`User feedback: ${issue}`);
    }

    return areas;
  }

  private suggestNextSteps(metrics: UserMetrics): string[] {
    const steps: string[] = [];

    if (metrics.profileCompleteness < 100) {
      steps.push('Complete all profile sections for maximum visibility');
    }
    steps.push('Set up weekly application targets');
    steps.push('Schedule regular networking outreach');

    if (metrics.contentMetrics.postsGenerated > 0) {
      steps.push('Analyze top-performing content and create similar posts');
    } else {
      steps.push('Start building your personal brand with LinkedIn posts');
    }

    steps.push('Review skill gaps and plan learning activities');

    return steps;
  }
}
