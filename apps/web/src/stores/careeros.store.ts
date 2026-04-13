import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  status: "idle" | "running" | "ready" | "error";
  focus: string;
  lastRunAt: string | null;
  findings: string[];
}

export interface GeneratedContentItem {
  id: string;
  title: string;
  channel: "linkedin" | "email" | "portfolio";
  body: string;
  createdAt: string;
}

export interface MemoryContext {
  careerNarrative: string;
  strengths: string[];
  gaps: string[];
  preferredTone: string;
}

export type UIMode = "cinematic" | "work";

export type NarrativeSectionId =
  | "identity"
  | "data"
  | "analysis"
  | "output"
  | "creation"
  | "opportunity";

interface CareerOSState {
  userProfile: UserProfile;
  repositories: RepositorySummary[];
  selectedRepositoryId: string;
  aiAnalysis: AIAnalysisState;
  generatedContent: GeneratedContentItem[];
  memoryContext: MemoryContext;
  commandPaletteOpen: boolean;
  uiMode: UIMode;
  activeNarrativeSection: NarrativeSectionId;
  chatOverlayOpen: boolean;
  setSelectedRepository: (repoId: string) => void;
  setAIStatus: (status: AIAnalysisState["status"]) => void;
  setAIFocus: (focus: string) => void;
  setAIFindings: (findings: string[]) => void;
  pushGeneratedContent: (item: Omit<GeneratedContentItem, "id" | "createdAt">) => void;
  updateMemoryContext: (updates: Partial<MemoryContext>) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setUIMode: (mode: UIMode) => void;
  setActiveNarrativeSection: (section: NarrativeSectionId) => void;
  setChatOverlayOpen: (open: boolean) => void;
}

const now = new Date().toISOString();

const initialRepositories: RepositorySummary[] = [
  {
    id: "repo-careeros-web",
    name: "careeros-web",
    fullName: "reece/careeros-web",
    language: "TypeScript",
    stars: 41,
    healthScore: 88,
    summary: "Main Next.js workspace powering CareerOS experiences.",
  },
  {
    id: "repo-workflows",
    name: "career-workflows",
    fullName: "reece/career-workflows",
    language: "Python",
    stars: 29,
    healthScore: 81,
    summary: "AI orchestration and scoring workflows for content and jobs.",
  },
  {
    id: "repo-ingestion",
    name: "portfolio-ingestion",
    fullName: "reece/portfolio-ingestion",
    language: "Go",
    stars: 18,
    healthScore: 76,
    summary: "Connectors that ingest GitHub and resume context into memory.",
  },
];
const defaultSelectedRepositoryId = initialRepositories[0]?.id ?? "";

export const useCareerOSStore = create<CareerOSState>()(
  persist(
    (set) => ({
      userProfile: {
        id: "u-1",
        name: "Alex Chen",
        role: "Senior Software Engineer",
        headline: "Building AI products with strong systems thinking",
        primaryGoal: "Move into a staff-level backend role in 2026",
      },
      repositories: initialRepositories,
      selectedRepositoryId: defaultSelectedRepositoryId,
      aiAnalysis: {
        status: "ready",
        focus: "Role-fit and content signal quality",
        lastRunAt: now,
        findings: [
          "Strong architecture language increases recruiter response rate.",
          "Recent commits map well to platform engineering narratives.",
        ],
      },
      generatedContent: [
        {
          id: "content-seed-1",
          title: "Scaling API reliability without slowing delivery",
          channel: "linkedin",
          body: "This week I focused on reliability guardrails in our API layer...",
          createdAt: now,
        },
      ],
      memoryContext: {
        careerNarrative: "Backend engineer growing toward staff-level ownership.",
        strengths: ["System design", "Execution speed", "Cross-team communication"],
        gaps: ["Public proof of impact", "Leadership storytelling"],
        preferredTone: "Technical and concise",
      },
      commandPaletteOpen: false,
      uiMode: "cinematic",
      activeNarrativeSection: "identity",
      chatOverlayOpen: false,
      setSelectedRepository: (selectedRepositoryId) => set({ selectedRepositoryId }),
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
            status: "ready",
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
      setUIMode: (uiMode) => set({ uiMode }),
      setActiveNarrativeSection: (activeNarrativeSection) => set({ activeNarrativeSection }),
      setChatOverlayOpen: (chatOverlayOpen) => set({ chatOverlayOpen }),
    }),
    { name: "careeros-web-state" },
  ),
);
