import type {
  PersonalizationDirective,
  UserActivityRecord,
  UserInsightsMemory,
  UserPreferencesMemory,
  UserProfileMemory,
} from "../memory/memory.types.js";
import {
  createDefaultRules,
  type PersonalizationRule,
} from "./rules/default.rules.js";
import {
  FeedbackAwareStrategy,
  type RecommendationStrategy,
} from "./strategies/recommendation.strategy.js";

export interface PersonalizationEngine {
  buildDirective(
    profile: UserProfileMemory,
    preferences: UserPreferencesMemory,
    insights: UserInsightsMemory,
    activities: UserActivityRecord[],
  ): PersonalizationDirective;
  learnFromFeedback(
    preferences: UserPreferencesMemory,
    insights: UserInsightsMemory,
    recentActivities: UserActivityRecord[],
  ): {
    preferencesPatch: Partial<UserPreferencesMemory>;
    insightsPatch: Partial<UserInsightsMemory>;
  };
}

export class RuleBasedPersonalizationEngine implements PersonalizationEngine {
  constructor(
    private readonly rules: PersonalizationRule[] = createDefaultRules(),
    private readonly strategy: RecommendationStrategy = new FeedbackAwareStrategy(),
  ) {}

  buildDirective(
    profile: UserProfileMemory,
    preferences: UserPreferencesMemory,
    insights: UserInsightsMemory,
    activities: UserActivityRecord[],
  ): PersonalizationDirective {
    let directive = this.strategy.buildDirective(
      profile,
      preferences,
      insights,
      activities,
    );

    for (const rule of this.rules) {
      directive = rule.apply({ profile, preferences, insights }, directive);
    }

    return {
      ...directive,
      promptDirectives: unique(directive.promptDirectives),
      prioritizedFocusAreas: unique(directive.prioritizedFocusAreas),
      suggestionBiases: unique(directive.suggestionBiases),
    };
  }

  learnFromFeedback(
    preferences: UserPreferencesMemory,
    insights: UserInsightsMemory,
    recentActivities: UserActivityRecord[],
  ): {
    preferencesPatch: Partial<UserPreferencesMemory>;
    insightsPatch: Partial<UserInsightsMemory>;
  } {
    const acceptedCount = recentActivities.filter((a) => a.accepted === true).length;
    const rejectedCount = recentActivities.filter((a) => a.accepted === false).length;

    const likes = recentActivities.filter((a) => a.explicitFeedback === "like").length;
    const dislikes = recentActivities.filter((a) => a.explicitFeedback === "dislike").length;

    let preferredPostLength = preferences.preferredPostLength;
    if (rejectedCount > acceptedCount) {
      preferredPostLength = "short";
    } else if (likes > dislikes + 2) {
      preferredPostLength = "medium";
    }

    const confidenceDelta = likes >= dislikes ? 0.05 : -0.05;

    return {
      preferencesPatch: {
        preferredPostLength,
      },
      insightsPatch: {
        confidence: clamp(insights.confidence + confidenceDelta, 0, 1),
      },
    };
  }
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
