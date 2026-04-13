import type {
  PersonalizationDirective,
  UserInsightsMemory,
  UserPreferencesMemory,
  UserProfileMemory,
} from "../../memory/memory.types.js";

export interface PersonalizationRule {
  id: string;
  apply(input: RuleInput, draft: PersonalizationDirective): PersonalizationDirective;
}

export interface RuleInput {
  profile: UserProfileMemory;
  preferences: UserPreferencesMemory;
  insights: UserInsightsMemory;
}

export class ToneRule implements PersonalizationRule {
  id = "tone-rule";

  apply(input: RuleInput, draft: PersonalizationDirective): PersonalizationDirective {
    const tone =
      input.preferences.tonePreference === "formal"
        ? "Use concise professional tone with clear structure."
        : input.preferences.tonePreference === "casual"
          ? "Use conversational language and practical examples."
          : "Use an approachable but professional tone.";

    return {
      ...draft,
      adaptiveTone: tone,
      promptDirectives: [...draft.promptDirectives, tone],
    };
  }
}

export class CareerGoalRule implements PersonalizationRule {
  id = "career-goal-rule";

  apply(input: RuleInput, draft: PersonalizationDirective): PersonalizationDirective {
    const goal = input.profile.careerGoal?.toLowerCase();
    const focusAreas = [...draft.prioritizedFocusAreas];
    const suggestionBiases = [...draft.suggestionBiases];

    if (goal?.includes("backend")) {
      focusAreas.push("distributed systems", "api design");
      suggestionBiases.push("prioritize backend-heavy portfolio suggestions");
    }
    if (goal?.includes("frontend")) {
      focusAreas.push("ui architecture", "design systems");
      suggestionBiases.push("prioritize frontend execution and UX storytelling");
    }
    if (goal?.includes("data")) {
      focusAreas.push("analytics", "machine learning");
      suggestionBiases.push("prioritize data projects with measurable outcomes");
    }

    if (input.profile.weaknesses.some((item) => item.toLowerCase().includes("system design"))) {
      focusAreas.push("system design");
      suggestionBiases.push("suggest focused system design practice before broadening stack");
    }

    return {
      ...draft,
      prioritizedFocusAreas: unique(focusAreas),
      suggestionBiases: unique(suggestionBiases),
    };
  }
}

export class StyleRule implements PersonalizationRule {
  id = "style-rule";

  apply(input: RuleInput, draft: PersonalizationDirective): PersonalizationDirective {
    const style =
      input.preferences.contentStyle === "storytelling"
        ? "Favor narrative arcs with concrete lessons."
        : input.preferences.contentStyle === "educational"
          ? "Favor tactical educational guidance with actionable steps."
          : input.preferences.contentStyle === "technical"
            ? "Favor technical depth and implementation specificity."
            : "Blend educational value with storytelling context.";

    return {
      ...draft,
      adaptiveStyle: style,
      promptDirectives: [...draft.promptDirectives, style],
    };
  }
}

export function createDefaultRules(): PersonalizationRule[] {
  return [new ToneRule(), new StyleRule(), new CareerGoalRule()];
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}
