export enum AgentType {
  PROFILE_OPTIMIZER = "PROFILE_OPTIMIZER",
  JOB_MATCHER = "JOB_MATCHER",
  SKILL_GAP_ANALYZER = "SKILL_GAP_ANALYZER",
  CONTENT_STRATEGIST = "CONTENT_STRATEGIST",
  OUTREACH_ASSISTANT = "OUTREACH_ASSISTANT",
  TREND_ANALYZER = "TREND_ANALYZER",
}

export enum AgentTaskStatus {
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

export enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export interface AgentTask {
  id: string;
  agentType: AgentType;
  input: Record<string, unknown>;
  status: AgentTaskStatus;
  result: Record<string, unknown> | null;
  error: string | null;
  createdAt: Date;
  completedAt: Date | null;
  metadata: Record<string, unknown>;
}

export interface SuggestedAction {
  type: string;
  description: string;
  priority: Priority;
  data: Record<string, unknown>;
}

export interface AgentResult {
  taskId: string;
  agentType: AgentType;
  success: boolean;
  data: unknown;
  /** Confidence score between 0 and 1 */
  confidence: number;
  reasoning: string;
  suggestedActions: SuggestedAction[];
}
