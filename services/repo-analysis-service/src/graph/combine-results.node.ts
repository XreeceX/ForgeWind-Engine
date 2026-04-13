import {
  CombinedAnalysis,
  RepoAnalysisState,
} from '../types/repo-analysis.types';

function buildDefaultCombinedAnalysis(state: RepoAnalysisState): CombinedAnalysis {
  return {
    technical: state.technicalAnalysis ?? {
      summary: 'Technical analysis unavailable.',
      architectureNotes: [],
      techStack: state.repoData.languages,
      complexity: 'Intermediate',
      riskFlags: ['Technical analysis missing'],
    },
    project: state.projectUnderstanding ?? {
      valueProposition: state.repoData.description || 'Project value proposition unavailable.',
      targetUsers: ['Developers'],
      differentiators: ['Implementation-first approach'],
      businessReadiness: 'Medium',
    },
    career: state.careerPositioning ?? {
      candidateNarrative: 'Candidate narrative unavailable.',
      roleFit: ['Software Engineer'],
      interviewTalkingPoints: ['System design and implementation'],
      marketSignals: state.repoData.languages.slice(0, 3),
    },
    content: state.contentIdeas ?? {
      postIdeas: ['Share build journey and decisions.'],
      articleIdeas: ['Deep-dive architecture breakdown.'],
      hooks: ['What changed after rebuilding this project.'],
      callToActions: ['What would you improve first?'],
    },
    improvements: state.improvements ?? {
      codeImprovements: ['Strengthen automated testing.'],
      documentationImprovements: ['Improve setup and architecture docs.'],
      portfolioImprovements: ['Add quantified impact and demos.'],
      priorityOrder: ['Testing', 'Docs', 'Storytelling'],
    },
  };
}

export async function combineResultsNode(
  state: RepoAnalysisState,
): Promise<RepoAnalysisState> {
  return {
    ...state,
    combinedAnalysis: buildDefaultCombinedAnalysis(state),
  };
}
