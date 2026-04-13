import type { AgentContext, AgentMemory, Document, Message } from "../types.js";

export type ExperienceLevel =
  | "student"
  | "intern"
  | "junior"
  | "mid"
  | "senior"
  | "lead"
  | "executive";

export type ContentStyle =
  | "educational"
  | "storytelling"
  | "educational_storytelling"
  | "technical"
  | "concise";

export type PostingFrequency = "low" | "medium" | "high";

export interface UserActivityPatterns {
  postingFrequency: PostingFrequency;
  engagementLevel: "low" | "medium" | "high";
}

export interface UserProfileMemory {
  userId: string;
  careerGoal?: string;
  targetRoles: string[];
  experienceLevel?: ExperienceLevel;
  skills: string[];
  weaknesses: string[];
  interests: string[];
  activityPatterns: UserActivityPatterns;
  profileVersion: number;
  updatedAt: string;
}

export interface UserPreferencesMemory {
  userId: string;
  tonePreference: "formal" | "balanced" | "casual";
  contentStyle: ContentStyle;
  postingFrequency: PostingFrequency;
  preferredPostLength: "short" | "medium" | "long";
  preferredFormats: string[];
  updatedAt: string;
}

export interface UserInsightsMemory {
  userId: string;
  strengths: string[];
  growthAreas: string[];
  positioning: string;
  confidence: number;
  generatedAt: string;
}

export type UserActivityType =
  | "generated_content"
  | "interaction"
  | "suggestion"
  | "feedback";

export interface UserActivityRecord {
  id: string;
  userId: string;
  type: UserActivityType;
  summary: string;
  metadata: Record<string, unknown>;
  accepted?: boolean;
  explicitFeedback?: "like" | "dislike" | "neutral";
  createdAt: string;
}

export interface MemoryCompressionSnapshot {
  generatedAt: string;
  coverageWindowStart: string;
  coverageWindowEnd: string;
  activityCount: number;
  acceptedRate: number;
  keyThemes: string[];
  summary: string;
}

export interface SessionContext {
  selectedRepo?: string;
  currentGoal?: string;
  lastUserIntent?: string;
}

export interface ShortTermExecutionMemory {
  sessionContext: SessionContext;
  shortTermContext: Record<string, unknown>;
  conversationHistory: Message[];
}

export type SemanticMemoryType =
  | "repository"
  | "resume"
  | "generated_post"
  | "interaction"
  | "skill"
  | "insight";

export interface SemanticDocument {
  id: string;
  userId: string;
  type: SemanticMemoryType;
  content: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface ContextRetrievalItem {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  semanticScore: number;
  recencyScore: number;
  finalScore: number;
}

export interface PersonalizationDirective {
  promptDirectives: string[];
  prioritizedFocusAreas: string[];
  suggestionBiases: string[];
  adaptiveTone: string;
  adaptiveStyle: string;
}

export interface ContextPackage {
  userProfile: UserProfileMemory;
  preferences: UserPreferencesMemory;
  insights: UserInsightsMemory;
  shortTerm: ShortTermExecutionMemory;
  semanticContext: ContextRetrievalItem[];
  compressionSnapshot?: MemoryCompressionSnapshot;
  personalization: PersonalizationDirective;
}

export interface AgentExecutionSummary {
  agentName: string;
  taskId: string;
  success: boolean;
  durationMs: number;
  confidence: number;
  output: unknown;
  promptInput: Record<string, unknown>;
}

export interface StructuredInsight {
  strengths: string[];
  growthAreas: string[];
  positioning?: string;
  acceptedOutput?: boolean;
  generatedContentSummary?: string;
  extractedSkills?: string[];
}

export interface MemoryReadResult {
  profile: UserProfileMemory;
  preferences: UserPreferencesMemory;
  insights: UserInsightsMemory;
  activities: UserActivityRecord[];
  compressionSnapshot?: MemoryCompressionSnapshot;
}

type BaseAgentMemory = Omit<
  AgentMemory,
  "sessionContext" | "contextPackage" | "personalizationContext"
>;

export interface AgentContextWithMemory extends Omit<AgentContext, "memory"> {
  memory: BaseAgentMemory & {
    sessionContext?: SessionContext;
    contextPackage?: ContextPackage;
    personalizationContext?: PersonalizationDirective;
  };
}

export interface RetrievedDocument extends Document {
  semanticScore?: number;
  recencyScore?: number;
  finalScore?: number;
}
