import {
  type MemoryCompressionSnapshot,
  type MemoryReadResult,
  type SemanticDocument,
  type StructuredInsight,
  type UserActivityRecord,
  type UserInsightsMemory,
  type UserPreferencesMemory,
  type UserProfileMemory,
} from "./memory.types.js";

const DEFAULT_PROFILE = (userId: string): UserProfileMemory => ({
  userId,
  careerGoal: undefined,
  targetRoles: [],
  experienceLevel: undefined,
  skills: [],
  weaknesses: [],
  interests: [],
  activityPatterns: {
    postingFrequency: "low",
    engagementLevel: "medium",
  },
  profileVersion: 1,
  updatedAt: new Date().toISOString(),
});

const DEFAULT_PREFERENCES = (userId: string): UserPreferencesMemory => ({
  userId,
  tonePreference: "balanced",
  contentStyle: "educational_storytelling",
  postingFrequency: "low",
  preferredPostLength: "medium",
  preferredFormats: ["text", "carousel"],
  updatedAt: new Date().toISOString(),
});

const DEFAULT_INSIGHTS = (userId: string): UserInsightsMemory => ({
  userId,
  strengths: [],
  growthAreas: [],
  positioning: "Early-stage professional building clarity and leverage.",
  confidence: 0.4,
  generatedAt: new Date().toISOString(),
});

export interface MemoryService {
  readUserMemory(userId: string): Promise<MemoryReadResult>;
  upsertUserProfile(
    userId: string,
    profilePatch: Partial<UserProfileMemory>,
  ): Promise<UserProfileMemory>;
  upsertUserPreferences(
    userId: string,
    preferencesPatch: Partial<UserPreferencesMemory>,
  ): Promise<UserPreferencesMemory>;
  upsertUserInsights(
    userId: string,
    insightsPatch: Partial<UserInsightsMemory>,
  ): Promise<UserInsightsMemory>;
  appendUserActivity(record: UserActivityRecord): Promise<void>;
  listRecentActivities(userId: string, limit: number): Promise<UserActivityRecord[]>;
  saveCompressionSnapshot(
    userId: string,
    snapshot: MemoryCompressionSnapshot,
  ): Promise<void>;
  getCompressionSnapshot(
    userId: string,
  ): Promise<MemoryCompressionSnapshot | undefined>;
  storeSemanticDocument(document: SemanticDocument): Promise<void>;
}

export class InMemoryMemoryService implements MemoryService {
  private readonly profiles = new Map<string, UserProfileMemory>();
  private readonly preferences = new Map<string, UserPreferencesMemory>();
  private readonly insights = new Map<string, UserInsightsMemory>();
  private readonly activities = new Map<string, UserActivityRecord[]>();
  private readonly compressionSnapshots = new Map<string, MemoryCompressionSnapshot>();
  private readonly semanticDocuments = new Map<string, SemanticDocument[]>();

  async readUserMemory(userId: string): Promise<MemoryReadResult> {
    const profile = this.profiles.get(userId) ?? DEFAULT_PROFILE(userId);
    const preferences =
      this.preferences.get(userId) ?? DEFAULT_PREFERENCES(userId);
    const insights = this.insights.get(userId) ?? DEFAULT_INSIGHTS(userId);
    const activities = this.activities.get(userId) ?? [];
    const compressionSnapshot = this.compressionSnapshots.get(userId);

    this.profiles.set(userId, profile);
    this.preferences.set(userId, preferences);
    this.insights.set(userId, insights);

    return {
      profile,
      preferences,
      insights,
      activities,
      compressionSnapshot,
    };
  }

  async upsertUserProfile(
    userId: string,
    profilePatch: Partial<UserProfileMemory>,
  ): Promise<UserProfileMemory> {
    const existing = this.profiles.get(userId) ?? DEFAULT_PROFILE(userId);
    const merged: UserProfileMemory = {
      ...existing,
      ...profilePatch,
      targetRoles: profilePatch.targetRoles ?? existing.targetRoles,
      skills: profilePatch.skills ?? existing.skills,
      weaknesses: profilePatch.weaknesses ?? existing.weaknesses,
      interests: profilePatch.interests ?? existing.interests,
      activityPatterns: {
        ...existing.activityPatterns,
        ...profilePatch.activityPatterns,
      },
      profileVersion: existing.profileVersion + 1,
      updatedAt: new Date().toISOString(),
    };
    this.profiles.set(userId, merged);
    return merged;
  }

  async upsertUserPreferences(
    userId: string,
    preferencesPatch: Partial<UserPreferencesMemory>,
  ): Promise<UserPreferencesMemory> {
    const existing = this.preferences.get(userId) ?? DEFAULT_PREFERENCES(userId);
    const merged: UserPreferencesMemory = {
      ...existing,
      ...preferencesPatch,
      preferredFormats:
        preferencesPatch.preferredFormats ?? existing.preferredFormats,
      updatedAt: new Date().toISOString(),
    };
    this.preferences.set(userId, merged);
    return merged;
  }

  async upsertUserInsights(
    userId: string,
    insightsPatch: Partial<UserInsightsMemory>,
  ): Promise<UserInsightsMemory> {
    const existing = this.insights.get(userId) ?? DEFAULT_INSIGHTS(userId);
    const merged: UserInsightsMemory = {
      ...existing,
      ...insightsPatch,
      strengths: insightsPatch.strengths ?? existing.strengths,
      growthAreas: insightsPatch.growthAreas ?? existing.growthAreas,
      generatedAt: new Date().toISOString(),
    };
    this.insights.set(userId, merged);
    return merged;
  }

  async appendUserActivity(record: UserActivityRecord): Promise<void> {
    const existing = this.activities.get(record.userId) ?? [];
    this.activities.set(record.userId, [record, ...existing]);
  }

  async listRecentActivities(
    userId: string,
    limit: number,
  ): Promise<UserActivityRecord[]> {
    return (this.activities.get(userId) ?? []).slice(0, limit);
  }

  async saveCompressionSnapshot(
    userId: string,
    snapshot: MemoryCompressionSnapshot,
  ): Promise<void> {
    this.compressionSnapshots.set(userId, snapshot);
  }

  async getCompressionSnapshot(
    userId: string,
  ): Promise<MemoryCompressionSnapshot | undefined> {
    return this.compressionSnapshots.get(userId);
  }

  async storeSemanticDocument(document: SemanticDocument): Promise<void> {
    const existing = this.semanticDocuments.get(document.userId) ?? [];
    this.semanticDocuments.set(document.userId, [document, ...existing]);
  }
}

export function mergeUnique(existing: string[], incoming: string[]): string[] {
  return [...new Set([...existing, ...incoming])];
}

export function toStructuredInsight(output: unknown): StructuredInsight {
  if (typeof output !== "object" || output === null) {
    return { strengths: [], growthAreas: [] };
  }

  const value = output as Record<string, unknown>;
  const strengths = toStringArray(value["strengths"]);
  const growthAreas =
    toStringArray(value["growthAreas"]) || toStringArray(value["weaknesses"]);
  const extractedSkills =
    toStringArray(value["skills"]) || toStringArray(value["recommendedSkills"]);

  return {
    strengths,
    growthAreas,
    positioning:
      typeof value["positioning"] === "string"
        ? value["positioning"]
        : undefined,
    generatedContentSummary:
      typeof value["content"] === "string"
        ? value["content"].slice(0, 280)
        : undefined,
    extractedSkills,
  };
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}
