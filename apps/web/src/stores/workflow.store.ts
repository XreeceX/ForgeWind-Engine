import { create } from "zustand";
import type {
  AiStreamEvent,
  WorkflowUiState,
} from "@/types/ai-stream";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}

interface WorkflowState {
  sessionId: string | null;
  selectedRepoId: string | null;
  state: WorkflowUiState;
  messages: ChatMessage[];
  events: AiStreamEvent[];
  actionSuggestions: string[];
  memoryContext: {
    careerGoal: string;
    skills: string[];
    preferredTone: string;
  } | null;
  finalOutput: string | null;
  streamError: string | null;
  setSessionId: (sessionId: string | null) => void;
  setSelectedRepoId: (repoId: string | null) => void;
  setState: (state: WorkflowUiState) => void;
  pushMessage: (message: Omit<ChatMessage, "id">) => void;
  ingestEvent: (event: AiStreamEvent) => void;
  setStreamError: (message: string | null) => void;
  clear: () => void;
}

export const useWorkflowStore = create<WorkflowState>((set) => ({
  sessionId: null,
  selectedRepoId: null,
  state: "IDLE",
  messages: [],
  events: [],
  actionSuggestions: [],
  memoryContext: null,
  finalOutput: null,
  streamError: null,
  setSessionId: (sessionId) => set({ sessionId }),
  setSelectedRepoId: (selectedRepoId) => set({ selectedRepoId }),
  setState: (state) => set({ state }),
  pushMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, { ...message, id: crypto.randomUUID() }],
    })),
  ingestEvent: (event) =>
    set((state) => {
      const next = {
        ...state,
        events: [...state.events, event],
      };

      switch (event.type) {
        case "state":
          return { ...next, state: event.state };
        case "thinking":
          return {
            ...next,
            messages: [
              ...next.messages,
              {
                id: crypto.randomUUID(),
                role: "assistant" as const,
                text: event.content,
              },
            ],
          };
        case "memory_context":
          return { ...next, memoryContext: event.content };
        case "action_suggestion":
          return { ...next, actionSuggestions: event.actions };
        case "final_output":
          return { ...next, finalOutput: event.content };
        default:
          return next;
      }
    }),
  setStreamError: (streamError) => set({ streamError }),
  clear: () =>
    set({
      sessionId: null,
      selectedRepoId: null,
      state: "IDLE",
      messages: [],
      events: [],
      actionSuggestions: [],
      memoryContext: null,
      finalOutput: null,
      streamError: null,
    }),
}));
