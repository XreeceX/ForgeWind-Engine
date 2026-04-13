export enum EventType {
  USER_CREATED = "USER_CREATED",
  USER_UPDATED = "USER_UPDATED",
  PROFILE_ANALYZED = "PROFILE_ANALYZED",
  RESUME_PARSED = "RESUME_PARSED",
  JOB_FOUND = "JOB_FOUND",
  JOB_MATCHED = "JOB_MATCHED",
  SKILL_GAP_IDENTIFIED = "SKILL_GAP_IDENTIFIED",
  CONTENT_GENERATED = "CONTENT_GENERATED",
  APPLICATION_SUBMITTED = "APPLICATION_SUBMITTED",
  MESSAGE_RECEIVED = "MESSAGE_RECEIVED",
  AGENT_TASK_COMPLETED = "AGENT_TASK_COMPLETED",
}

export interface DomainEvent {
  id: string;
  type: EventType;
  payload: Record<string, unknown>;
  userId: string;
  timestamp: Date;
  metadata: Record<string, unknown>;
}
