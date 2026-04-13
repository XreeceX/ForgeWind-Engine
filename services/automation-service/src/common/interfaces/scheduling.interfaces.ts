export type ReminderType =
  | 'follow_up'
  | 'application_deadline'
  | 'interview'
  | 'networking'
  | 'content_post'
  | 'custom';

export type ScheduleFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly';

export interface Reminder {
  id: string;
  userId: string;
  title: string;
  description: string;
  dueDate: Date;
  type: ReminderType;
  completed: boolean;
  createdAt: Date;
}

export interface ReminderParams {
  userId: string;
  title: string;
  description: string;
  dueDate: string;
  type: ReminderType;
}

export interface ScheduledAction {
  type: string;
  params: Record<string, unknown>;
  time: string;
}

export interface Schedule {
  id: string;
  userId: string;
  name: string;
  description: string;
  frequency: ScheduleFrequency;
  actions: ScheduledAction[];
  isActive: boolean;
  createdAt: Date;
}

export interface ScheduleParams {
  userId: string;
  name: string;
  description: string;
  frequency: ScheduleFrequency;
  actions: ScheduledAction[];
}
