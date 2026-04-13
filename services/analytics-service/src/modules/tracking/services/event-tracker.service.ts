import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  TrackableEvent,
  EventFilters,
  EventCategory,
} from '../../../common/interfaces';

@Injectable()
export class EventTrackerService {
  private readonly logger = new Logger(EventTrackerService.name);
  private readonly events = new Map<string, TrackableEvent[]>();

  async trackEvent(
    userId: string,
    eventType: EventCategory,
    action: string,
    metadata: Record<string, unknown> = {},
  ): Promise<TrackableEvent> {
    const event: TrackableEvent = {
      id: randomUUID(),
      userId,
      eventType,
      action,
      metadata,
      timestamp: new Date(),
    };

    const userEvents = this.events.get(userId) ?? [];
    userEvents.push(event);
    this.events.set(userId, userEvents);

    this.logger.log(
      `Tracked event [${eventType}] "${action}" for user ${userId}`,
    );

    return event;
  }

  async getEvents(
    userId: string,
    filters?: EventFilters,
  ): Promise<TrackableEvent[]> {
    const userEvents = this.events.get(userId) ?? [];

    if (!filters) {
      return userEvents;
    }

    return userEvents.filter((event) => {
      if (filters.eventType && event.eventType !== filters.eventType) {
        return false;
      }
      if (filters.action && event.action !== filters.action) {
        return false;
      }
      if (filters.startDate && event.timestamp < filters.startDate) {
        return false;
      }
      if (filters.endDate && event.timestamp > filters.endDate) {
        return false;
      }
      return true;
    });
  }

  async getEventCountByCategory(
    userId: string,
  ): Promise<Record<string, number>> {
    const userEvents = this.events.get(userId) ?? [];
    const counts: Record<string, number> = {};

    for (const event of userEvents) {
      counts[event.eventType] = (counts[event.eventType] ?? 0) + 1;
    }

    return counts;
  }

  async getRecentEvents(
    userId: string,
    days: number,
  ): Promise<TrackableEvent[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return this.getEvents(userId, { startDate: cutoff });
  }
}
