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

export interface ExperienceItem {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string | null;
  description: string;
  employmentType: string;
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  field: string;
  startYear: string;
  endYear: string;
}

export interface SkillItem {
  id: string;
  name: string;
  category: string;
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
  openToWork: boolean;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillItem[];
  commandPaletteOpen: boolean;
  activeNarrativeSection: NarrativeSectionId;
  chatOverlayOpen: boolean;
  setOpenToWork: (open: boolean) => void;
  addExperience: (item: Omit<ExperienceItem, 'id'>) => void;
  updateExperience: (id: string, patch: Partial<ExperienceItem>) => void;
  removeExperience: (id: string) => void;
  addEducation: (item: Omit<EducationItem, 'id'>) => void;
  updateEducation: (id: string, patch: Partial<EducationItem>) => void;
  removeEducation: (id: string) => void;
  addSkill: (item: Omit<SkillItem, 'id'>) => void;
  removeSkill: (id: string) => void;
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

export const useForgeWindStore = create<ForgeWindState>()(
  persist(
    (set, _get) => ({
      forgeWindUserId: null,
      agentSnapshot: null,
      userProfile: {
        id: '',
        name: '',
        role: '',
        headline: '',
        primaryGoal: '',
      },
      repositories: [],
      selectedRepositoryId: '',
      aiAnalysis: {
        status: 'idle',
        focus: '',
        lastRunAt: null,
        findings: [],
      },
      generatedContent: [],
      memoryContext: {
        careerNarrative: '',
        strengths: [],
        gaps: [],
        preferredTone: 'professional',
      },
      openToWork: false,
      experience: [],
      education: [],
      skills: [],
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
      setOpenToWork: (openToWork) => set({ openToWork }),
      addExperience: (item) =>
        set((s) => ({ experience: [{ ...item, id: crypto.randomUUID() }, ...s.experience] })),
      updateExperience: (id, patch) =>
        set((s) => ({
          experience: s.experience.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        })),
      removeExperience: (id) =>
        set((s) => ({ experience: s.experience.filter((e) => e.id !== id) })),
      addEducation: (item) =>
        set((s) => ({ education: [{ ...item, id: crypto.randomUUID() }, ...s.education] })),
      updateEducation: (id, patch) =>
        set((s) => ({ education: s.education.map((e) => (e.id === id ? { ...e, ...patch } : e)) })),
      removeEducation: (id) => set((s) => ({ education: s.education.filter((e) => e.id !== id) })),
      addSkill: (item) =>
        set((s) => ({ skills: [{ ...item, id: crypto.randomUUID() }, ...s.skills] })),
      removeSkill: (id) => set((s) => ({ skills: s.skills.filter((sk) => sk.id !== id) })),
      setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
      setActiveNarrativeSection: (activeNarrativeSection) => set({ activeNarrativeSection }),
      setChatOverlayOpen: (chatOverlayOpen) => set({ chatOverlayOpen }),
    }),
    { name: 'forgewind-web-state-v4' },
  ),
);
