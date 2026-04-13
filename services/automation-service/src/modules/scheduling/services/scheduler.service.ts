import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  Reminder,
  ReminderParams,
  Schedule,
  ScheduleParams,
  ScheduledAction,
} from '../../../common/interfaces';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);
  private readonly reminders = new Map<string, Reminder[]>();
  private readonly schedules = new Map<string, Schedule[]>();

  async createReminder(params: ReminderParams): Promise<Reminder> {
    const dueDate = new Date(params.dueDate);
    if (isNaN(dueDate.getTime())) {
      throw new BadRequestException('Invalid dueDate format');
    }

    const reminder: Reminder = {
      id: randomUUID(),
      userId: params.userId,
      title: params.title,
      description: params.description,
      dueDate,
      type: params.type,
      completed: false,
      createdAt: new Date(),
    };

    const userReminders = this.reminders.get(params.userId) ?? [];
    userReminders.push(reminder);
    this.reminders.set(params.userId, userReminders);

    this.logger.log(
      `Created reminder "${params.title}" for user ${params.userId} due ${params.dueDate}`,
    );

    return reminder;
  }

  async getReminders(userId: string): Promise<Reminder[]> {
    const userReminders = this.reminders.get(userId) ?? [];
    return userReminders.sort(
      (a, b) => a.dueDate.getTime() - b.dueDate.getTime(),
    );
  }

  async updateReminder(
    userId: string,
    reminderId: string,
    updates: {
      title?: string;
      description?: string;
      dueDate?: string;
      completed?: boolean;
    },
  ): Promise<Reminder> {
    const userReminders = this.reminders.get(userId) ?? [];
    const idx = userReminders.findIndex((r) => r.id === reminderId);

    if (idx === -1) {
      throw new NotFoundException(
        `Reminder ${reminderId} not found for user ${userId}`,
      );
    }

    const reminder = userReminders[idx]!;

    if (updates.title !== undefined) {
      reminder.title = updates.title;
    }
    if (updates.description !== undefined) {
      reminder.description = updates.description;
    }
    if (updates.dueDate !== undefined) {
      const parsedDate = new Date(updates.dueDate);
      if (isNaN(parsedDate.getTime())) {
        throw new BadRequestException('Invalid dueDate format');
      }
      reminder.dueDate = parsedDate;
    }
    if (updates.completed !== undefined) {
      reminder.completed = updates.completed;
    }

    userReminders[idx] = reminder;
    this.reminders.set(userId, userReminders);

    this.logger.log(`Updated reminder ${reminderId} for user ${userId}`);

    return reminder;
  }

  async createSchedule(params: ScheduleParams): Promise<Schedule> {
    this.validateActions(params.actions);

    const schedule: Schedule = {
      id: randomUUID(),
      userId: params.userId,
      name: params.name,
      description: params.description,
      frequency: params.frequency,
      actions: params.actions,
      isActive: true,
      createdAt: new Date(),
    };

    const userSchedules = this.schedules.get(params.userId) ?? [];
    userSchedules.push(schedule);
    this.schedules.set(params.userId, userSchedules);

    this.logger.log(
      `Created schedule "${params.name}" (${params.frequency}) for user ${params.userId}`,
    );

    return schedule;
  }

  async getSchedules(userId: string): Promise<Schedule[]> {
    return this.schedules.get(userId) ?? [];
  }

  async getUpcomingReminders(userId: string, days: number): Promise<Reminder[]> {
    const allReminders = await this.getReminders(userId);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + days);

    return allReminders.filter(
      (r) => !r.completed && r.dueDate <= cutoff && r.dueDate >= new Date(),
    );
  }

  private validateActions(actions: ScheduledAction[]): void {
    const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

    for (const action of actions) {
      if (!timeRegex.test(action.time)) {
        throw new BadRequestException(
          `Invalid time format "${action.time}". Expected HH:mm (24-hour).`,
        );
      }
    }
  }
}
