export type UiWorkflowState =
  | 'IDLE'
  | 'CONNECTING'
  | 'ANALYZING'
  | 'THINKING'
  | 'GENERATING_ACTIONS'
  | 'GENERATING_OUTPUT'
  | 'COMPLETED';

export interface SessionSummary {
  sessionId: string;
  userId: string;
  selectedRepoId?: string;
  intent: string;
  state: UiWorkflowState;
  createdAt: string;
}

interface BaseAiEvent {
  sessionId: string;
  timestamp: string;
}

export interface StateEvent extends BaseAiEvent {
  type: 'state';
  state: UiWorkflowState;
}

export interface ThinkingEvent extends BaseAiEvent {
  type: 'thinking';
  content: string;
}

export interface MemoryContextEvent extends BaseAiEvent {
  type: 'memory_context';
  content: {
    careerGoal: string;
    skills: string[];
    preferredTone: string;
  };
}

export interface ActionSuggestionEvent extends BaseAiEvent {
  type: 'action_suggestion';
  actions: string[];
}

export interface FinalOutputEvent extends BaseAiEvent {
  type: 'final_output';
  content: string;
}

export type AiStreamEvent =
  | StateEvent
  | ThinkingEvent
  | MemoryContextEvent
  | ActionSuggestionEvent
  | FinalOutputEvent;
