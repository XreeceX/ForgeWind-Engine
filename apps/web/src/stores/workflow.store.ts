import { create } from "zustand";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}

interface WorkflowState {
  sessionId: string | null;
  selectedRepoId: string | null;
  messages: ChatMessage[];
  setSessionId: (sessionId: string | null) => void;
  setSelectedRepoId: (repoId: string | null) => void;
  pushMessage: (message: Omit<ChatMessage, "id">) => void;
  clear: () => void;
}

export const useWorkflowStore = create<WorkflowState>((set) => ({
  sessionId: null,
  selectedRepoId: null,
  messages: [],
  setSessionId: (sessionId) => set({ sessionId }),
  setSelectedRepoId: (selectedRepoId) => set({ selectedRepoId }),
  pushMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, { ...message, id: crypto.randomUUID() }],
    })),
  clear: () =>
    set({
      sessionId: null,
      selectedRepoId: null,
      messages: [],
    }),
}));
