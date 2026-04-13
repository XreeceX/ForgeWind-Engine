import { contentIdeasSchema } from '../../types/repo-analysis.schemas';
import { ContentIdeas, RepoAnalysisState } from '../../types/repo-analysis.types';
import { callLLM } from '../../utils/llm';
import { validateWithRetry } from '../../utils/validator';

function contentIdeasFallback(state: RepoAnalysisState): ContentIdeas {
  const projectName = state.repoData.name;
  return {
    postIdeas: [
      `How I engineered ${projectName} and what I would improve in v2`,
      `From idea to implementation: technical lessons from ${projectName}`,
      `Architecture tradeoffs I made while building ${projectName}`,
    ],
    articleIdeas: [
      `Designing a scalable version of ${projectName}`,
      `${projectName}: turning a side project into a portfolio signal`,
    ],
    hooks: [
      'I stopped shipping one-off demos and started building recruiter-readable systems.',
      'This repository changed how I explain engineering impact in interviews.',
    ],
    callToActions: [
      'Comment with your preferred architecture alternative.',
      'Share the improvement you would prioritize first.',
    ],
  };
}

export async function contentIdeasAgent(
  state: RepoAnalysisState,
): Promise<RepoAnalysisState> {
  try {
    const prompt = [
      'Generate high-quality LinkedIn content ideas from this repository analysis.',
      'Return JSON with keys: postIdeas[], articleIdeas[], hooks[], callToActions[].',
      `Repo: ${state.repoData.fullName}`,
      `Technical analysis: ${JSON.stringify(state.technicalAnalysis ?? {})}`,
      `Project understanding: ${JSON.stringify(state.projectUnderstanding ?? {})}`,
      `Target audience: ${state.audience ?? 'Engineering leaders and peers'}`,
    ].join('\n');

    const result = await validateWithRetry({
      agentName: 'ContentIdeasAgent',
      schema: contentIdeasSchema,
      retries: 2,
      invoke: async () =>
        callLLM({
          agentName: 'content-ideas',
          prompt,
          mockResponse: () => contentIdeasFallback(state),
        }),
      fallback: () => contentIdeasFallback(state),
    });

    return {
      ...state,
      contentIdeas: result.data,
      errors: [...state.errors, ...result.errors],
    };
  } catch (error) {
    return {
      ...state,
      contentIdeas: contentIdeasFallback(state),
      errors: [
        ...state.errors,
        `[ContentIdeasAgent] Fatal error: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      ],
    };
  }
}
