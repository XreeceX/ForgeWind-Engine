export type WorkflowUiState =
  | "IDLE"
  | "CONNECTING"
  | "ANALYZING"
  | "THINKING"
  | "GENERATING_ACTIONS"
  | "GENERATING_OUTPUT"
  | "COMPLETED";

export interface BaseAiStreamEvent {
  type:
    | "state"
    | "thinking"
    | "memory_context"
    | "action_suggestion"
    | "final_output";
  sessionId: string;
  timestamp: string;
}

export interface StateAiStreamEvent extends BaseAiStreamEvent {
  type: "state";
  state: WorkflowUiState;
}

export interface ThinkingAiStreamEvent extends BaseAiStreamEvent {
  type: "thinking";
  content: string;
}

export interface MemoryContextAiStreamEvent extends BaseAiStreamEvent {
  type: "memory_context";
  content: {
    careerGoal: string;
    skills: string[];
    preferredTone: string;
  };
}

export interface ActionSuggestionAiStreamEvent extends BaseAiStreamEvent {
  type: "action_suggestion";
  actions: string[];
}

export interface FinalOutputAiStreamEvent extends BaseAiStreamEvent {
  type: "final_output";
  content: string;
}

export type AiStreamEvent =
  | StateAiStreamEvent
  | ThinkingAiStreamEvent
  | MemoryContextAiStreamEvent
  | ActionSuggestionAiStreamEvent
  | FinalOutputAiStreamEvent;

export interface CreateAiSessionPayload {
  intent: string;
  selectedRepoId?: string;
  prompt?: string;
}
