import { technicalAnalysisSchema } from '../../types/repo-analysis.schemas';
import {
  RepoAnalysisState,
  TechnicalAnalysis,
} from '../../types/repo-analysis.types';
import { callLLM } from '../../utils/llm';
import { validateWithRetry } from '../../utils/validator';

function technicalFallback(state: RepoAnalysisState): TechnicalAnalysis {
  return {
    summary: `${state.repoData.name} demonstrates practical engineering delivery with a focus on ${state.repoData.languages[0] ?? 'modern software tooling'}.`,
    architectureNotes: [
      state.repoData.fileTreeSummary,
      `Repository includes ${state.repoData.keyFiles.length} key files worth highlighting in technical storytelling.`,
    ],
    techStack: state.repoData.languages.length > 0 ? state.repoData.languages : ['TypeScript'],
    complexity: state.repoData.commits > 150 ? 'Advanced' : 'Intermediate',
    riskFlags: ['Testing depth not validated from static metadata alone.'],
  };
}

export async function technicalAnalysisAgent(
  state: RepoAnalysisState,
): Promise<RepoAnalysisState> {
  try {
    const prompt = [
      'Analyze this repository from a technical architecture perspective.',
      'Return JSON with keys: summary, architectureNotes[], techStack[], complexity, riskFlags[].',
      `Repository: ${state.repoData.fullName}`,
      `Description: ${state.repoData.description}`,
      `Languages: ${state.repoData.languages.join(', ')}`,
      `Stars: ${state.repoData.stars}, Commits: ${state.repoData.commits}`,
      `File summary: ${state.repoData.fileTreeSummary}`,
      `Key files: ${state.repoData.keyFiles.join(', ')}`,
      `README excerpt: ${state.repoData.readme.slice(0, 3000)}`,
    ].join('\n');

    const result = await validateWithRetry({
      agentName: 'TechnicalAnalysisAgent',
      schema: technicalAnalysisSchema,
      retries: 2,
      invoke: async () =>
        callLLM({
          agentName: 'technical-analysis',
          prompt,
          mockResponse: () => technicalFallback(state),
        }),
      fallback: () => technicalFallback(state),
    });

    return {
      ...state,
      technicalAnalysis: result.data,
      errors: [...state.errors, ...result.errors],
    };
  } catch (error) {
    return {
      ...state,
      technicalAnalysis: technicalFallback(state),
      errors: [
        ...state.errors,
        `[TechnicalAnalysisAgent] Fatal error: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      ],
    };
  }
}
