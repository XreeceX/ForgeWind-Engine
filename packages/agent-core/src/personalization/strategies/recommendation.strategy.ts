import type {
  PersonalizationDirective,
  UserActivityRecord,
  UserInsightsMemory,
  UserPreferencesMemory,
  UserProfileMemory,
} from "../../memory/memory.types.js";

export interface RecommendationStrategy {
  id: string;
  buildDirective(
    profile: UserProfileMemory,
    preferences: UserPreferencesMemory,
    insights: UserInsightsMemory,
    activities: UserActivityRecord[],
  ): PersonalizationDirective;
}

export class FeedbackAwareStrategy implements RecommendationStrategy {
  id = "feedback-aware-strategy";

  buildDirective(
    profile: UserProfileMemory,
    preferences: UserPreferencesMemory,
    insights: UserInsightsMemory,
    activities: UserActivityRecord[],
  ): PersonalizationDirective {
    const accepted = activities.filter((a) => a.accepted === true);
    const rejected = activities.filter((a) => a.accepted === false);

    const directive: PersonalizationDirective = {
      promptDirectives: [
        `Career goal: ${profile.careerGoal ?? "not specified"}`,
        `Experience level: ${profile.experienceLevel ?? "not specified"}`,
      ],
      prioritizedFocusAreas: [...profile.skills.slice(0, 5), ...insights.growthAreas],
      suggestionBiases: [],
      adaptiveTone: `Default to ${preferences.tonePreference} tone.`,
      adaptiveStyle: `Use ${preferences.contentStyle} style.`,
    };

    if (accepted.length >= rejected.length && accepted.length > 0) {
      directive.suggestionBiases.push("favor previously accepted output patterns");
    }

    if (rejected.length > accepted.length) {
      directive.suggestionBiases.push("keep responses shorter and more explicit");
      directive.promptDirectives.push(
        "User has rejected recent outputs; increase clarity and reduce abstraction.",
      );
    }

    const feedbackSignals = activities
      .slice(0, 20)
      .map((item) => item.explicitFeedback)
      .filter(
        (value): value is "like" | "dislike" | "neutral" =>
          value === "like" || value === "dislike" || value === "neutral",
      );

    const likes = feedbackSignals.filter((v) => v === "like").length;
    const dislikes = feedbackSignals.filter((v) => v === "dislike").length;
    if (likes > dislikes) {
      directive.promptDirectives.push("Maintain current direction; feedback trend is positive.");
    } else if (dislikes > likes) {
      directive.promptDirectives.push("Prefer concise alternative approaches with explicit trade-offs.");
    }

    return directive;
  }
}
