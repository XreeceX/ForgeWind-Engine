import { finalContentSchema } from '../../types/repo-analysis.schemas';
import { RepoAnalysisState } from '../../types/repo-analysis.types';
import { callLLM, streamLLMText } from '../../utils/llm';
import { validateWithRetry } from '../../utils/validator';

function finalContentFallback(state: RepoAnalysisState): string {
  const tone = state.tone ?? 'confident and practical';
  const audience = state.audience ?? 'engineering peers and hiring managers';
  const technicalSummary = state.technicalAnalysis?.summary ?? 'Built a production-minded repository.';
  const narrative =
    state.careerPositioning?.candidateNarrative ??
    'I focus on transforming ideas into reliable software systems.';
  const topImprovement =
    state.improvements?.priorityOrder[0] ?? 'Expand tests and documentation for stronger production readiness.';

  return [
    `I recently analyzed ${state.repoData.fullName} to sharpen how I communicate technical impact.`,
    '',
    technicalSummary,
    '',
    `${narrative} For this iteration, my next priority is: ${topImprovement}`,
    '',
    `Tone: ${tone}. Audience: ${audience}.`,
    '',
    `If you reviewed this repository, what improvement would you ship first?`,
  ].join('\n');
}

export interface FinalContentAgentOptions {
  onToken?: (chunk: string) => void;
}

export async function finalContentGenerationAgent(
  state: RepoAnalysisState,
  options?: FinalContentAgentOptions,
): Promise<RepoAnalysisState> {
  try {
    const complexity = state.technicalAnalysis?.complexity ?? 'Intermediate';
    const audience = state.audience ?? (complexity === 'Beginner' ? 'aspiring developers' : 'senior engineers');
    const tone = state.tone ?? (complexity === 'Advanced' ? 'thought leadership' : 'educational');

    const prompt = [
      'Generate a polished LinkedIn post from this combined repository analysis.',
      'Return JSON with a single key: finalContent.',
      `Tone: ${tone}`,
      `Audience: ${audience}`,
      `Combined analysis: ${JSON.stringify(state.combinedAnalysis ?? {})}`,
      `Top hook: ${state.contentIdeas?.hooks[0] ?? ''}`,
      `Top CTA: ${state.contentIdeas?.callToActions[0] ?? ''}`,
    ].join('\n');

    const fallbackContent = finalContentFallback({ ...state, tone, audience });
    if (options?.onToken) {
      const streamingPrompt = [
        'Write a polished LinkedIn post using this repository analysis.',
        'Do not return JSON. Return plain text only.',
        `Tone: ${tone}`,
        `Audience: ${audience}`,
        `Combined analysis: ${JSON.stringify(state.combinedAnalysis ?? {})}`,
        `Top hook: ${state.contentIdeas?.hooks[0] ?? ''}`,
        `Top CTA: ${state.contentIdeas?.callToActions[0] ?? ''}`,
      ].join('\n');

      const streamRetries = 2;
      for (let attempt = 1; attempt <= streamRetries + 1; attempt += 1) {
        const streamResult = await streamLLMText({
          agentName: 'final-content-stream',
          prompt: streamingPrompt,
          onToken: options.onToken,
        });

        const parsed = finalContentSchema.safeParse({ finalContent: streamResult.text });
        if (streamResult.status === 'completed' && parsed.success) {
          return {
            ...state,
            tone,
            audience,
            finalContent: parsed.data.finalContent,
          };
        }

        if (streamResult.status === 'partial_error') {
          options.onToken('\n\n[stream interrupted, switching to fallback]\n\n');
          options.onToken(fallbackContent);
          return {
            ...state,
            tone,
            audience,
            finalContent: fallbackContent,
            errors: [
              ...state.errors,
              `[FinalContentGenerationAgent] Stream interrupted after partial emission on attempt ${attempt}. Fallback applied.`,
            ],
          };
        }

        if (attempt > streamRetries) {
          options.onToken(fallbackContent);
          return {
            ...state,
            tone,
            audience,
            finalContent: fallbackContent,
            errors: [
              ...state.errors,
              `[FinalContentGenerationAgent] Stream failed after ${attempt} attempts. Fallback applied.`,
            ],
          };
        }
      }

      return {
        ...state,
        tone,
        audience,
        finalContent: fallbackContent,
        errors: [
          ...state.errors,
          '[FinalContentGenerationAgent] Stream retries exhausted unexpectedly.',
        ],
      };
    }

    const result = await validateWithRetry({
      agentName: 'FinalContentGenerationAgent',
      schema: finalContentSchema,
      retries: 2,
      invoke: async () =>
        callLLM({
          agentName: 'final-content',
          prompt,
          mockResponse: () => ({ finalContent: fallbackContent }),
        }),
      fallback: () => ({ finalContent: fallbackContent }),
    });

    return {
      ...state,
      tone,
      audience,
      finalContent: result.data.finalContent,
      errors: [...state.errors, ...result.errors],
    };
  } catch (error) {
    return {
      ...state,
      finalContent: finalContentFallback(state),
      errors: [
        ...state.errors,
        `[FinalContentGenerationAgent] Fatal error: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      ],
    };
  }
}
