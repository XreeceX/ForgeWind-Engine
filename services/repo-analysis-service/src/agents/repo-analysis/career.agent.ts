import { careerPositioningSchema } from '../../types/repo-analysis.schemas';
import {
  CareerPositioning,
  RepoAnalysisState,
} from '../../types/repo-analysis.types';
import { callLLM } from '../../utils/llm';
import { validateWithRetry } from '../../utils/validator';

function careerFallback(state: RepoAnalysisState): CareerPositioning {
  return {
    candidateNarrative:
      'Engineer who converts product ideas into deployable systems with measurable technical depth.',
    roleFit: ['Backend Engineer', 'Full-Stack Engineer', 'Platform Engineer'],
    interviewTalkingPoints: [
      'System decomposition and service boundaries',
      'Tradeoffs between speed of delivery and maintainability',
      'Validation and resilience strategy for AI-assisted workflows',
    ],
    marketSignals: [
      ...((state.technicalAnalysis?.techStack ?? state.repoData.languages) as string[]).slice(0, 4),
    ],
  };
}

export async function careerPositioningAgent(
  state: RepoAnalysisState,
): Promise<RepoAnalysisState> {
  try {
    const prompt = [
      'Position this repository as career capital for a software engineer.',
      'Return JSON with keys: candidateNarrative, roleFit[], interviewTalkingPoints[], marketSignals[].',
      `Repository: ${state.repoData.fullName}`,
      `Technical analysis: ${JSON.stringify(state.technicalAnalysis ?? {})}`,
      `Project understanding: ${JSON.stringify(state.projectUnderstanding ?? {})}`,
    ].join('\n');

    const result = await validateWithRetry({
      agentName: 'CareerPositioningAgent',
      schema: careerPositioningSchema,
      retries: 2,
      invoke: async () =>
        callLLM({
          agentName: 'career-positioning',
          prompt,
          mockResponse: () => careerFallback(state),
        }),
      fallback: () => careerFallback(state),
    });

    return {
      ...state,
      careerPositioning: result.data,
      errors: [...state.errors, ...result.errors],
    };
  } catch (error) {
    return {
      ...state,
      careerPositioning: careerFallback(state),
      errors: [
        ...state.errors,
        `[CareerPositioningAgent] Fatal error: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      ],
    };
  }
}
