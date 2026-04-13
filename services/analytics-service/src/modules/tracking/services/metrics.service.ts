import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import { EventTrackerService } from './event-tracker.service';
import {
  UserMetrics,
  DailyActivity,
  EventCategory,
  TrackableEvent,
} from '../../../common/interfaces';

@Injectable()
export class MetricsService {
  constructor(private readonly eventTracker: EventTrackerService) {}

  async calculateUserMetrics(userId: string): Promise<UserMetrics> {
    const allEvents = await this.eventTracker.getEvents(userId);
    const recentEvents = await this.eventTracker.getRecentEvents(userId, 30);
    const previousPeriodEvents = allEvents.filter((e) => {
      const ts = dayjs(e.timestamp);
      return (
        ts.isAfter(dayjs().subtract(60, 'day')) &&
        ts.isBefore(dayjs().subtract(30, 'day'))
      );
    });

    return {
      profileCompleteness: this.calculateProfileCompleteness(allEvents),
      profileViews: this.calculateProfileViews(recentEvents, previousPeriodEvents),
      applicationMetrics: this.calculateApplicationMetrics(allEvents),
      contentMetrics: this.calculateContentMetrics(allEvents),
      skillProgress: this.calculateSkillProgress(allEvents),
      networkGrowth: this.calculateNetworkGrowth(recentEvents),
      overallCareerScore: this.calculateCareerScore(allEvents),
      weeklyActivity: this.calculateWeeklyActivity(recentEvents),
    };
  }

  private calculateProfileCompleteness(events: TrackableEvent[]): number {
    const profileActions = new Set(
      events
        .filter((e) => e.eventType === EventCategory.PROFILE_VIEW)
        .map((e) => e.action),
    );

    const expectedSections = [
      'headline_updated',
      'summary_updated',
      'experience_added',
      'education_added',
      'skills_added',
      'photo_uploaded',
      'certifications_added',
    ];

    const completed = expectedSections.filter((s) =>
      profileActions.has(s),
    ).length;

    return Math.round((completed / expectedSections.length) * 100);
  }

  private calculateProfileViews(
    recent: TrackableEvent[],
    previous: TrackableEvent[],
  ): { total: number; trend: 'up' | 'down' | 'stable'; weeklyAvg: number } {
    const recentViews = recent.filter(
      (e) =>
        e.eventType === EventCategory.PROFILE_VIEW &&
        e.action === 'profile_viewed',
    );
    const previousViews = previous.filter(
      (e) =>
        e.eventType === EventCategory.PROFILE_VIEW &&
        e.action === 'profile_viewed',
    );

    const total = recentViews.length;
    const previousTotal = previousViews.length;
    const weeklyAvg = Math.round(total / 4);

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (total > previousTotal * 1.1) trend = 'up';
    else if (total < previousTotal * 0.9) trend = 'down';

    return { total, trend, weeklyAvg };
  }

  private calculateApplicationMetrics(events: TrackableEvent[]): {
    total: number;
    responseRate: number;
    interviewRate: number;
    avgTimeToResponse: number;
  } {
    const applicationEvents = events.filter(
      (e) => e.eventType === EventCategory.JOB_APPLICATION,
    );

    const total = applicationEvents.filter(
      (e) => e.action === 'application_submitted',
    ).length;
    const responses = applicationEvents.filter(
      (e) => e.action === 'response_received',
    ).length;
    const interviews = applicationEvents.filter(
      (e) => e.action === 'interview_scheduled',
    ).length;

    const responseRate = total > 0 ? Math.round((responses / total) * 100) : 0;
    const interviewRate =
      total > 0 ? Math.round((interviews / total) * 100) : 0;

    const responseTimes = applicationEvents
      .filter((e) => e.action === 'response_received' && e.metadata['daysToRespond'])
      .map((e) => e.metadata['daysToRespond'] as number);

    const avgTimeToResponse =
      responseTimes.length > 0
        ? Math.round(
            responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
          )
        : 0;

    return { total, responseRate, interviewRate, avgTimeToResponse };
  }

  private calculateContentMetrics(events: TrackableEvent[]): {
    postsGenerated: number;
    avgEngagement: number;
    topPerformingTopics: string[];
  } {
    const contentEvents = events.filter(
      (e) => e.eventType === EventCategory.CONTENT_GENERATED,
    );

    const postsGenerated = contentEvents.filter(
      (e) => e.action === 'post_created',
    ).length;

    const engagements = contentEvents
      .filter((e) => e.metadata['engagement'] !== undefined)
      .map((e) => e.metadata['engagement'] as number);

    const avgEngagement =
      engagements.length > 0
        ? Math.round(
            engagements.reduce((a, b) => a + b, 0) / engagements.length,
          )
        : 0;

    const topicCounts = new Map<string, number>();
    for (const event of contentEvents) {
      const topic = event.metadata['topic'] as string | undefined;
      if (topic) {
        topicCounts.set(topic, (topicCounts.get(topic) ?? 0) + 1);
      }
    }

    const topPerformingTopics = [...topicCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic]) => topic);

    return { postsGenerated, avgEngagement, topPerformingTopics };
  }

  private calculateSkillProgress(events: TrackableEvent[]): {
    skillsAdded: number;
    assessmentsCompleted: number;
    gapsClosed: number;
  } {
    const featureEvents = events.filter(
      (e) => e.eventType === EventCategory.FEATURE_USAGE,
    );

    const skillsAdded = featureEvents.filter(
      (e) => e.action === 'skill_added',
    ).length;
    const assessmentsCompleted = featureEvents.filter(
      (e) => e.action === 'assessment_completed',
    ).length;
    const gapsClosed = featureEvents.filter(
      (e) => e.action === 'skill_gap_closed',
    ).length;

    return { skillsAdded, assessmentsCompleted, gapsClosed };
  }

  private calculateNetworkGrowth(recent: TrackableEvent[]): {
    newConnections: number;
    outreachSent: number;
    responseRate: number;
  } {
    const networkEvents = recent.filter(
      (e) =>
        e.eventType === EventCategory.AGENT_INTERACTION ||
        e.eventType === EventCategory.FEATURE_USAGE,
    );

    const newConnections = networkEvents.filter(
      (e) => e.action === 'connection_added',
    ).length;
    const outreachSent = networkEvents.filter(
      (e) => e.action === 'outreach_sent',
    ).length;
    const outreachResponses = networkEvents.filter(
      (e) => e.action === 'outreach_response',
    ).length;

    const responseRate =
      outreachSent > 0
        ? Math.round((outreachResponses / outreachSent) * 100)
        : 0;

    return { newConnections, outreachSent, responseRate };
  }

  private calculateCareerScore(events: TrackableEvent[]): number {
    const weights = {
      profileActivity: 20,
      applications: 25,
      content: 15,
      skills: 20,
      networking: 20,
    };

    const profileEvents = events.filter(
      (e) => e.eventType === EventCategory.PROFILE_VIEW,
    ).length;
    const applicationEvents = events.filter(
      (e) => e.eventType === EventCategory.JOB_APPLICATION,
    ).length;
    const contentEvents = events.filter(
      (e) => e.eventType === EventCategory.CONTENT_GENERATED,
    ).length;
    const featureEvents = events.filter(
      (e) => e.eventType === EventCategory.FEATURE_USAGE,
    ).length;
    const networkEvents = events.filter(
      (e) => e.eventType === EventCategory.AGENT_INTERACTION,
    ).length;

    const normalize = (count: number, max: number): number =>
      Math.min(count / max, 1);

    const score =
      normalize(profileEvents, 50) * weights.profileActivity +
      normalize(applicationEvents, 30) * weights.applications +
      normalize(contentEvents, 20) * weights.content +
      normalize(featureEvents, 40) * weights.skills +
      normalize(networkEvents, 25) * weights.networking;

    return Math.round(Math.min(score, 100));
  }

  private calculateWeeklyActivity(recent: TrackableEvent[]): DailyActivity[] {
    const activityMap = new Map<string, DailyActivity>();

    for (let i = 6; i >= 0; i--) {
      const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
      activityMap.set(date, { date, actions: 0, categories: {} });
    }

    for (const event of recent) {
      const date = dayjs(event.timestamp).format('YYYY-MM-DD');
      const day = activityMap.get(date);
      if (day) {
        day.actions += 1;
        day.categories[event.eventType] =
          (day.categories[event.eventType] ?? 0) + 1;
      }
    }

    return [...activityMap.values()];
  }
}
