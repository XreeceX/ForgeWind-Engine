import { careerPositioningAgent } from '../agents/repo-analysis/career.agent';
import { contentIdeasAgent } from '../agents/repo-analysis/content-ideas.agent';
import { finalContentGenerationAgent } from '../agents/repo-analysis/final-content.agent';
import { improvementSuggestionsAgent } from '../agents/repo-analysis/improvement.agent';
import { projectUnderstandingAgent } from '../agents/repo-analysis/project.agent';
import { technicalAnalysisAgent } from '../agents/repo-analysis/technical.agent';
import {
  BranchStrategy,
  RepoAnalysisState,
  RepoComplexity,
} from '../types/repo-analysis.types';
import { combineResultsNode } from './combine-results.node';

function mergeParallelStates(
  base: RepoAnalysisState,
  careerState: RepoAnalysisState,
  contentState: RepoAnalysisState,
): RepoAnalysisState {
  const mergedErrors = [...new Set([...base.errors, ...careerState.errors, ...contentState.errors])];

  return {
    ...base,
    careerPositioning: careerState.careerPositioning ?? base.careerPositioning,
    contentIdeas: contentState.contentIdeas ?? base.contentIdeas,
    errors: mergedErrors,
  };
}

function resolveBranchStrategy(complexity: RepoComplexity): BranchStrategy {
  if (complexity === 'Beginner') {
    return 'beginner-fast-track';
  }
  if (complexity === 'Advanced') {
    return 'advanced-thought-leadership';
  }
  return 'standard-full-pipeline';
}

export interface RepoAnalysisGraphOptions {
  onFinalContentChunk?: (chunk: string) => void;
}

export async function runRepoAnalysisGraph(
  initialState: RepoAnalysisState,
  options?: RepoAnalysisGraphOptions,
): Promise<RepoAnalysisState> {
  let state: RepoAnalysisState = {
    ...initialState,
    errors: initialState.errors ?? [],
    executionPath: initialState.executionPath ?? [],
  };

  state = await technicalAnalysisAgent(state);
  const complexity = state.technicalAnalysis?.complexity ?? 'Intermediate';
  const branchStrategy = resolveBranchStrategy(complexity);
  state = {
    ...state,
    branchStrategy,
    executionPath: [...(state.executionPath ?? []), `branch:${branchStrategy}`],
  };

  if (branchStrategy === 'beginner-fast-track') {
    state = await projectUnderstandingAgent(state);
    state = await contentIdeasAgent(state);
    state = await combineResultsNode(state);
    state = await finalContentGenerationAgent(state, {
      onToken: options?.onFinalContentChunk,
    });

    return {
      ...state,
      executionPath: [...(state.executionPath ?? []), 'technical', 'project', 'content', 'combine', 'final'],
    };
  }

  state = await projectUnderstandingAgent(state);
  const [careerState, contentState] = await Promise.all([
    careerPositioningAgent({ ...state }),
    contentIdeasAgent({ ...state }),
  ]);
  state = mergeParallelStates(state, careerState, contentState);
  state = await improvementSuggestionsAgent(state);
  state = await combineResultsNode(state);
  state = await finalContentGenerationAgent(state, {
    onToken: options?.onFinalContentChunk,
  });

  return {
    ...state,
    executionPath: [
      ...(state.executionPath ?? []),
      'technical',
      'project',
      'parallel:career+content',
      'improvement',
      'combine',
      'final',
    ],
  };
}
