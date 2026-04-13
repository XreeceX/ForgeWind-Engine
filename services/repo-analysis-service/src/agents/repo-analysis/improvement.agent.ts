import { improvementsSchema } from '../../types/repo-analysis.schemas';
import { Improvements, RepoAnalysisState } from '../../types/repo-analysis.types';
import { callLLM } from '../../utils/llm';
import { validateWithRetry } from '../../utils/validator';

function improvementsFallback(): Improvements {
  return {
    codeImprovements: [
      'Increase automated test coverage for core logic and edge cases.',
      'Add observability events around high-value execution paths.',
    ],
    documentationImprovements: [
      'Expand README with architecture diagrams and setup troubleshooting.',
      'Document design decisions and explicit tradeoffs in an ADR-style section.',
    ],
    portfolioImprovements: [
      'Add quantified impact statements for speed, reliability, or usability.',
      'Include a demo walkthrough linking technical choices to business value.',
    ],
    priorityOrder: [
      'Test coverage and CI hardening',
      'Architecture and onboarding documentation',
      'Portfolio storytelling with measurable outcomes',
    ],
  };
}

export async function improvementSuggestionsAgent(
  state: RepoAnalysisState,
): Promise<RepoAnalysisState> {
  try {
    const prompt = [
      'Suggest prioritized repository improvements for engineering quality and career impact.',
      'Return JSON with keys: codeImprovements[], documentationImprovements[], portfolioImprovements[], priorityOrder[].',
      `Repo: ${state.repoData.fullName}`,
      `Technical analysis: ${JSON.stringify(state.technicalAnalysis ?? {})}`,
      `Project understanding: ${JSON.stringify(state.projectUnderstanding ?? {})}`,
      `Career positioning: ${JSON.stringify(state.careerPositioning ?? {})}`,
      `Content ideas: ${JSON.stringify(state.contentIdeas ?? {})}`,
    ].join('\n');

    const result = await validateWithRetry({
      agentName: 'ImprovementSuggestionsAgent',
      schema: improvementsSchema,
      retries: 2,
      invoke: async () =>
        callLLM({
          agentName: 'improvement-suggestions',
          prompt,
          mockResponse: () => improvementsFallback(),
        }),
      fallback: () => improvementsFallback(),
    });

    return {
      ...state,
      improvements: result.data,
      errors: [...state.errors, ...result.errors],
    };
  } catch (error) {
    return {
      ...state,
      improvements: improvementsFallback(),
      errors: [
        ...state.errors,
        `[ImprovementSuggestionsAgent] Fatal error: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      ],
    };
  }
}
