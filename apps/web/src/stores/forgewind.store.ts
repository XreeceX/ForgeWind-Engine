import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ForgeWindApiUser } from '@/lib/forgewind-api';
import { forgeWindFetch, getForgeWindApiBaseUrl } from '@/lib/forgewind-api';

export interface UserProfile {
  id: string;
  name: string;
  role: string;
  headline: string;
  primaryGoal: string;
}

export interface RepositorySummary {
  id: string;
  name: string;
  fullName: string;
  language: string;
  stars: number;
  healthScore: number;
  summary: string;
}

export interface AIAnalysisState {
  status: 'idle' | 'running' | 'ready' | 'error';
  focus: string;
  lastRunAt: string | null;
  findings: string[];
}

export interface GeneratedContentItem {
  id: string;
  title: string;
  channel: 'linkedin' | 'email' | 'portfolio';
  body: string;
  createdAt: string;
}

export interface MemoryContext {
  careerNarrative: string;
  strengths: string[];
  gaps: string[];
  preferredTone: string;
}

export type NarrativeSectionId =
  | 'identity'
  | 'data'
  | 'analysis'
  | 'output'
  | 'creation'
  | 'opportunity';

export interface ForgeWindAgentSnapshot {
  mode: string;
  agentStatus: string;
  lastAction: string | null;
}

interface ForgeWindState {
  forgeWindUserId: string | null;
  agentSnapshot: ForgeWindAgentSnapshot | null;
  userProfile: UserProfile;
  repositories: RepositorySummary[];
  selectedRepositoryId: string;
  aiAnalysis: AIAnalysisState;
  generatedContent: GeneratedContentItem[];
  memoryContext: MemoryContext;
  commandPaletteOpen: boolean;
  activeNarrativeSection: NarrativeSectionId;
  chatOverlayOpen: boolean;
  setForgeWindUserId: (id: string | null) => void;
  setRepositories: (repos: RepositorySummary[]) => void;
  applyForgeWindUserFromApi: (user: ForgeWindApiUser) => void;
  setAgentSnapshot: (snapshot: ForgeWindAgentSnapshot | null) => void;
  patchRepository: (repoId: string, patch: Partial<RepositorySummary>) => void;
  setSelectedRepository: (repoId: string, accessToken?: string | null) => void;
  setAIStatus: (status: AIAnalysisState['status']) => void;
  setAIFocus: (focus: string) => void;
  setAIFindings: (findings: string[]) => void;
  pushGeneratedContent: (item: Omit<GeneratedContentItem, 'id' | 'createdAt'>) => void;
  updateMemoryContext: (updates: Partial<MemoryContext>) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setActiveNarrativeSection: (section: NarrativeSectionId) => void;
  setChatOverlayOpen: (open: boolean) => void;
}

const now = new Date().toISOString();

export const useForgeWindStore = create<ForgeWindState>()(
  persist(
    (set, _get) => ({
      forgeWindUserId: null,
      agentSnapshot: null,
      userProfile: {
        id: 'local-session',
        name: 'Alex Chen',
        role: 'Senior Software Engineer',
        headline: 'Building AI products with strong systems thinking',
        primaryGoal: 'Move into a staff-level backend role in 2026',
      },
      repositories: [],
      selectedRepositoryId: '',
      aiAnalysis: {
        status: 'ready',
        focus: 'Role-fit and content signal quality',
        lastRunAt: now,
        findings: [
          'Strong architecture language increases recruiter response rate.',
          'Recent commits map well to platform engineering narratives.',
        ],
      },
      generatedContent: [
        {
          id: 'content-seed-1',
          title: 'Scaling API reliability without slowing delivery',
          channel: 'linkedin',
          body: 'This week I focused on reliability guardrails in our API layer...',
          createdAt: now,
        },
      ],
      memoryContext: {
        careerNarrative: 'Backend engineer growing toward staff-level ownership.',
        strengths: ['System design', 'Execution speed', 'Cross-team communication'],
        gaps: ['Public proof of impact', 'Leadership storytelling'],
        preferredTone: 'Technical and concise',
      },
      commandPaletteOpen: false,
      activeNarrativeSection: 'identity',
      chatOverlayOpen: false,
      setForgeWindUserId: (forgeWindUserId) => set({ forgeWindUserId }),
      setRepositories: (repositories) => set({ repositories }),
      applyForgeWindUserFromApi: (user) =>
        set((state) => ({
          forgeWindUserId: user.id,
          userProfile: {
            ...state.userProfile,
            id: user.id,
            name: user.username,
          },
        })),
      setAgentSnapshot: (agentSnapshot) => set({ agentSnapshot }),
      patchRepository: (repoId, patch) =>
        set((state) => ({
          repositories: state.repositories.map((r) => (r.id === repoId ? { ...r, ...patch } : r)),
        })),
      setSelectedRepository: (selectedRepositoryId, accessToken) => {
        set({ selectedRepositoryId });
        if (!accessToken || !getForgeWindApiBaseUrl()) return;
        void (async () => {
          try {
            await forgeWindFetch(`/repositories/${selectedRepositoryId}/activate`, {
              method: 'PATCH',
              accessToken,
              body: JSON.stringify({ isActive: true }),
            });
          } catch {
            /* non-fatal: local selection still applies */
          }
        })();
      },
      setAIStatus: (status) =>
        set((state) => ({
          aiAnalysis: {
            ...state.aiAnalysis,
            status,
            lastRunAt: new Date().toISOString(),
          },
        })),
      setAIFocus: (focus) =>
        set((state) => ({
          aiAnalysis: {
            ...state.aiAnalysis,
            focus,
          },
        })),
      setAIFindings: (findings) =>
        set((state) => ({
          aiAnalysis: {
            ...state.aiAnalysis,
            findings,
            status: 'ready',
            lastRunAt: new Date().toISOString(),
          },
        })),
      pushGeneratedContent: (item) =>
        set((state) => ({
          generatedContent: [
            {
              ...item,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
            },
            ...state.generatedContent,
          ],
        })),
      updateMemoryContext: (updates) =>
        set((state) => ({
          memoryContext: {
            ...state.memoryContext,
            ...updates,
          },
        })),
      setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
      setActiveNarrativeSection: (activeNarrativeSection) => set({ activeNarrativeSection }),
      setChatOverlayOpen: (chatOverlayOpen) => set({ chatOverlayOpen }),
    }),
    { name: 'forgewind-web-state-v2' },
  ),
);
