import pino from "pino";
import type { AgentContext, Document } from "../types.js";
import {
  InMemoryMemoryService,
  mergeUnique,
  toStructuredInsight,
  type MemoryService,
} from "./memory.service.js";
import {
  RuleBasedPersonalizationEngine,
  type PersonalizationEngine,
} from "../personalization/personalization.engine.js";
import {
  DeterministicEmbeddingService,
  type EmbeddingService,
} from "../vector/embedding.service.js";
import {
  InMemoryVectorStore,
  RetrievalService,
  type VectorStore,
} from "../vector/retrieval.service.js";
import type {
  AgentContextWithMemory,
  AgentExecutionSummary,
  ContextPackage,
  MemoryCompressionSnapshot,
  RetrievedDocument,
  SemanticDocument,
  SessionContext,
  StructuredInsight,
  UserActivityRecord,
  UserInsightsMemory,
  UserProfileMemory,
} from "./memory.types.js";

const MAX_PROMPT_CONTEXT_DOCS = 8;
const MAX_ACTIVITY_HISTORY = 40;

export interface MemoryOrchestrator {
  beforeExecution(context: AgentContext): Promise<AgentContextWithMemory>;
  afterExecution(
    context: AgentContextWithMemory,
    summary: AgentExecutionSummary,
  ): Promise<void>;
  recordFeedback(
    userId: string,
    feedback: Pick<UserActivityRecord, "accepted" | "explicitFeedback" | "summary">,
  ): Promise<void>;
}

export interface MemoryOrchestratorDependencies {
  memoryService?: MemoryService;
  personalizationEngine?: PersonalizationEngine;
  embeddingService?: EmbeddingService;
  vectorStore?: VectorStore;
  logger?: pino.Logger;
}

export class DefaultMemoryOrchestrator implements MemoryOrchestrator {
  private readonly retrievalService: RetrievalService;
  private readonly memoryService: MemoryService;
  private readonly personalizationEngine: PersonalizationEngine;
  private readonly logger: pino.Logger;

  constructor(deps: MemoryOrchestratorDependencies = {}) {
    this.logger =
      deps.logger ??
      pino({
        name: "memory-orchestrator",
        level: process.env["LOG_LEVEL"] ?? "info",
      });
    this.memoryService = deps.memoryService ?? new InMemoryMemoryService();
    this.personalizationEngine =
      deps.personalizationEngine ?? new RuleBasedPersonalizationEngine();
    this.retrievalService = new RetrievalService(
      deps.embeddingService ?? new DeterministicEmbeddingService(),
      deps.vectorStore ?? new InMemoryVectorStore(),
    );
  }

  async beforeExecution(context: AgentContext): Promise<AgentContextWithMemory> {
    const sessionContext = this.extractSessionContext(context);
    try {
      const memory = await this.memoryService.readUserMemory(context.userId);
      const semanticContext = await this.retrievalService.retrieve({
        userId: context.userId,
        query: this.buildSemanticQuery(context),
        topK: MAX_PROMPT_CONTEXT_DOCS,
      });

      const personalization = this.personalizationEngine.buildDirective(
        memory.profile,
        memory.preferences,
        memory.insights,
        memory.activities.slice(0, MAX_ACTIVITY_HISTORY),
      );

      const contextPackage: ContextPackage = {
        userProfile: memory.profile,
        preferences: memory.preferences,
        insights: memory.insights,
        shortTerm: {
          sessionContext,
          shortTermContext: context.memory.shortTermContext,
          conversationHistory: context.memory.conversationHistory,
        },
        semanticContext,
        compressionSnapshot: memory.compressionSnapshot,
        personalization,
      };

      return {
        ...context,
        memory: {
          conversationHistory: context.memory.conversationHistory,
          shortTermContext: context.memory.shortTermContext,
          sessionContext,
          contextPackage,
          personalizationContext: personalization,
          retrievedDocuments: mergeRetrievedDocuments(
            context.memory.retrievedDocuments,
            toRetrievedDocuments(semanticContext),
          ),
        },
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        { userId: context.userId, error: message },
        "Memory fetch failed; continuing with baseline context",
      );
      return {
        ...context,
        memory: {
          conversationHistory: context.memory.conversationHistory,
          shortTermContext: context.memory.shortTermContext,
          retrievedDocuments: context.memory.retrievedDocuments,
          sessionContext,
        },
      };
    }
  }

  async afterExecution(
    context: AgentContextWithMemory,
    summary: AgentExecutionSummary,
  ): Promise<void> {
    try {
      const insight = toStructuredInsight(summary.output);
      await this.updateLongTermMemory(context.userId, insight);
      await this.storeExecutionActivity(context, summary, insight);
      await this.storeSemanticArtifacts(context, summary, insight);
      await this.maybeCompressMemory(context.userId);
      await this.applyLearningUpdates(context.userId);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        { userId: context.userId, taskId: context.taskId, error: message },
        "Post-execution memory updates failed",
      );
    }
  }

  async recordFeedback(
    userId: string,
    feedback: Pick<UserActivityRecord, "accepted" | "explicitFeedback" | "summary">,
  ): Promise<void> {
    const record: UserActivityRecord = {
      id: this.newId("feedback"),
      userId,
      type: "feedback",
      summary: feedback.summary,
      metadata: {},
      accepted: feedback.accepted,
      explicitFeedback: feedback.explicitFeedback,
      createdAt: new Date().toISOString(),
    };
    await this.memoryService.appendUserActivity(record);
    await this.applyLearningUpdates(userId);
  }

  private extractSessionContext(context: AgentContext): SessionContext {
    const short = context.memory.shortTermContext;
    return {
      selectedRepo:
        typeof short["selectedRepo"] === "string"
          ? short["selectedRepo"]
          : undefined,
      currentGoal:
        typeof short["currentGoal"] === "string" ? short["currentGoal"] : undefined,
      lastUserIntent:
        typeof short["lastUserIntent"] === "string"
          ? short["lastUserIntent"]
          : undefined,
    };
  }

  private buildSemanticQuery(context: AgentContext): string {
    const inputHints = Object.entries(context.input)
      .slice(0, 8)
      .map(([key, value]) => `${key}:${stringifyValue(value)}`)
      .join(" | ");

    return `task=${context.taskId} ${inputHints}`.trim();
  }

  private async updateLongTermMemory(
    userId: string,
    insight: StructuredInsight,
  ): Promise<void> {
    const memory = await this.memoryService.readUserMemory(userId);
    const nextProfilePatch: Partial<UserProfileMemory> = {
      skills: mergeUnique(memory.profile.skills, insight.extractedSkills ?? []),
      weaknesses: mergeUnique(memory.profile.weaknesses, insight.growthAreas),
    };

    const nextInsightsPatch: Partial<UserInsightsMemory> = {
      strengths: mergeUnique(memory.insights.strengths, insight.strengths),
      growthAreas: mergeUnique(memory.insights.growthAreas, insight.growthAreas),
      positioning: insight.positioning ?? memory.insights.positioning,
    };

    await this.memoryService.upsertUserProfile(userId, nextProfilePatch);
    await this.memoryService.upsertUserInsights(userId, nextInsightsPatch);
  }

  private async storeExecutionActivity(
    context: AgentContextWithMemory,
    summary: AgentExecutionSummary,
    insight: StructuredInsight,
  ): Promise<void> {
    const accepted = this.extractAcceptedSignal(context, insight);
    const activity: UserActivityRecord = {
      id: this.newId("activity"),
      userId: context.userId,
      type: "generated_content",
      summary: `${summary.agentName}: ${summarizeOutput(summary.output)}`,
      metadata: {
        taskId: summary.taskId,
        durationMs: summary.durationMs,
        confidence: summary.confidence,
      },
      accepted,
      createdAt: new Date().toISOString(),
    };

    await this.memoryService.appendUserActivity(activity);
  }

  private async storeSemanticArtifacts(
    context: AgentContextWithMemory,
    summary: AgentExecutionSummary,
    insight: StructuredInsight,
  ): Promise<void> {
    const docs: SemanticDocument[] = [
      {
        id: this.newId("semantic"),
        userId: context.userId,
        type: "interaction",
        content: `Task ${summary.taskId} input: ${JSON.stringify(summary.promptInput)}`,
        metadata: { agentName: summary.agentName },
        createdAt: new Date().toISOString(),
      },
      {
        id: this.newId("semantic"),
        userId: context.userId,
        type: "generated_post",
        content:
          insight.generatedContentSummary ??
          `Output summary: ${summarizeOutput(summary.output)}`,
        metadata: { accepted: this.extractAcceptedSignal(context, insight) },
        createdAt: new Date().toISOString(),
      },
    ];

    for (const doc of docs) {
      await this.memoryService.storeSemanticDocument(doc);
      await this.retrievalService.store(doc);
    }
  }

  private async maybeCompressMemory(userId: string): Promise<void> {
    const activities = await this.memoryService.listRecentActivities(
      userId,
      MAX_ACTIVITY_HISTORY,
    );
    if (activities.length < 20) return;

    const compressed = this.compressActivities(activities);
    await this.memoryService.saveCompressionSnapshot(userId, compressed);
  }

  private compressActivities(
    activities: UserActivityRecord[],
  ): MemoryCompressionSnapshot {
    const oldest = activities[activities.length - 1];
    const newest = activities[0];
    const acceptedCount = activities.filter((a) => a.accepted === true).length;
    const acceptedRate = acceptedCount / activities.length;
    const themes = topKeywords(activities.map((a) => a.summary), 5);

    return {
      generatedAt: new Date().toISOString(),
      coverageWindowStart: oldest?.createdAt ?? new Date().toISOString(),
      coverageWindowEnd: newest?.createdAt ?? new Date().toISOString(),
      activityCount: activities.length,
      acceptedRate: round(acceptedRate),
      keyThemes: themes,
      summary: `Compressed ${activities.length} activities. Acceptance rate ${Math.round(acceptedRate * 100)}%. Dominant themes: ${themes.join(", ")}.`,
    };
  }

  private async applyLearningUpdates(userId: string): Promise<void> {
    const memory = await this.memoryService.readUserMemory(userId);
    const recent = memory.activities.slice(0, MAX_ACTIVITY_HISTORY);
    const learning = this.personalizationEngine.learnFromFeedback(
      memory.preferences,
      memory.insights,
      recent,
    );
    await this.memoryService.upsertUserPreferences(userId, learning.preferencesPatch);
    await this.memoryService.upsertUserInsights(userId, learning.insightsPatch);
  }

  private extractAcceptedSignal(
    context: AgentContextWithMemory,
    insight: StructuredInsight,
  ): boolean | undefined {
    if (typeof insight.acceptedOutput === "boolean") {
      return insight.acceptedOutput;
    }
    const accepted = context.input["accepted"];
    return typeof accepted === "boolean" ? accepted : undefined;
  }

  private newId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }
}

function stringifyValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map((item) => stringifyValue(item)).join(",");
  if (typeof value === "object" && value !== null) return JSON.stringify(value);
  return "unknown";
}

function toRetrievedDocuments(items: ContextPackage["semanticContext"]): RetrievedDocument[] {
  return items.map((item): RetrievedDocument => ({
    id: item.id,
    content: item.content,
    metadata: item.metadata,
    relevanceScore: item.finalScore,
    semanticScore: item.semanticScore,
    recencyScore: item.recencyScore,
    finalScore: item.finalScore,
  }));
}

function summarizeOutput(output: unknown): string {
  if (typeof output === "string") {
    return output.slice(0, 180);
  }
  if (typeof output === "number" || typeof output === "boolean") {
    return String(output);
  }
  if (typeof output === "object" && output !== null) {
    return JSON.stringify(output).slice(0, 180);
  }
  return "No output";
}

function topKeywords(texts: string[], topN: number): string[] {
  const stopWords = new Set([
    "the",
    "and",
    "for",
    "with",
    "that",
    "this",
    "from",
    "your",
    "about",
    "task",
    "output",
  ]);

  const counts = new Map<string, number>();
  for (const text of texts) {
    for (const raw of text.toLowerCase().split(/[^a-z0-9]+/)) {
      if (raw.length < 4 || stopWords.has(raw)) continue;
      counts.set(raw, (counts.get(raw) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([keyword]) => keyword);
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

export function formatContextInjectionMessage(
  contextPackage: ContextPackage | undefined,
): string | null {
  if (!contextPackage) return null;

  const profile = contextPackage.userProfile;
  const prefs = contextPackage.preferences;
  const insights = contextPackage.insights;
  const semantic = contextPackage.semanticContext.slice(0, 5);
  const guidance = contextPackage.personalization;

  const lines: string[] = [
    "User Context:",
    `- Career Goal: ${profile.careerGoal ?? "unknown"}`,
    `- Experience Level: ${profile.experienceLevel ?? "unknown"}`,
    `- Preferred Tone: ${prefs.tonePreference}`,
    `- Content Style: ${prefs.contentStyle}`,
    `- Known Skills: ${profile.skills.join(", ") || "none recorded"}`,
    `- Weaknesses: ${profile.weaknesses.join(", ") || "none recorded"}`,
    `- Strengths: ${insights.strengths.join(", ") || "none recorded"}`,
    "",
    "Personalization Directives:",
    ...guidance.promptDirectives.map((directive) => `- ${directive}`),
    "",
    "Relevant Past Context:",
    ...semantic.map(
      (item) =>
        `- (${item.finalScore.toFixed(2)}) ${item.content.slice(0, 180)}`,
    ),
  ];

  if (contextPackage.compressionSnapshot) {
    lines.push(
      "",
      `Memory Compression: ${contextPackage.compressionSnapshot.summary}`,
    );
  }

  return lines.join("\n");
}

export function mergeRetrievedDocuments(
  existing: Document[],
  injected: Document[],
): Document[] {
  const byId = new Map<string, Document>();
  for (const doc of [...existing, ...injected]) {
    byId.set(doc.id, doc);
  }
  return [...byId.values()].sort((a, b) => b.relevanceScore - a.relevanceScore);
}
