import { projectUnderstandingSchema } from '../../types/repo-analysis.schemas';
import {
  ProjectUnderstanding,
  RepoAnalysisState,
} from '../../types/repo-analysis.types';
import { callLLM } from '../../utils/llm';
import { validateWithRetry } from '../../utils/validator';

function projectFallback(state: RepoAnalysisState): ProjectUnderstanding {
  return {
    valueProposition:
      state.repoData.description ||
      `${state.repoData.name} provides a pragmatic implementation that can be positioned as a portfolio proof-of-work.`,
    targetUsers: ['Hiring managers', 'Engineering interviewers', 'Technical collaborators'],
    differentiators: [
      'Demonstrates ability to ship a complete solution',
      'Shows practical use of modern tooling and repository hygiene',
    ],
    businessReadiness: state.repoData.stars > 20 ? 'High' : 'Medium',
  };
}

export async function projectUnderstandingAgent(
  state: RepoAnalysisState,
): Promise<RepoAnalysisState> {
  try {
    const prompt = [
      'Explain what this project is, who it serves, and why it is valuable.',
      'Return JSON with keys: valueProposition, targetUsers[], differentiators[], businessReadiness.',
      `Repository: ${state.repoData.fullName}`,
      `Description: ${state.repoData.description}`,
      `README excerpt: ${state.repoData.readme.slice(0, 3000)}`,
      `Technical summary: ${state.technicalAnalysis?.summary ?? 'Not available.'}`,
    ].join('\n');

    const result = await validateWithRetry({
      agentName: 'ProjectUnderstandingAgent',
      schema: projectUnderstandingSchema,
      retries: 2,
      invoke: async () =>
        callLLM({
          agentName: 'project-understanding',
          prompt,
          mockResponse: () => projectFallback(state),
        }),
      fallback: () => projectFallback(state),
    });

    return {
      ...state,
      projectUnderstanding: result.data,
      errors: [...state.errors, ...result.errors],
    };
  } catch (error) {
    return {
      ...state,
      projectUnderstanding: projectFallback(state),
      errors: [
        ...state.errors,
        `[ProjectUnderstandingAgent] Fatal error: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      ],
    };
  }
}
