import { runRepoAnalysisGraph } from './graph/repo-analysis.graph';
import { RepoAnalysisState } from './types/repo-analysis.types';

async function run(): Promise<void> {
  const initialState: RepoAnalysisState = {
    repoData: {
      id: 'demo-repo',
      name: 'repo-analysis-demo',
      fullName: 'demo/repo-analysis-demo',
      description: 'A portfolio-grade AI pipeline for repository-to-content generation.',
      readme:
        'This project analyzes GitHub repositories and transforms them into technical narratives for career growth.',
      languages: ['TypeScript', 'NestJS'],
      stars: 42,
      commits: 187,
      fileTreeSummary: 'Repository has service, graph, agent, and infra modules.',
      keyFiles: ['README.md', 'services/repo-analysis-service/src/graph/repo-analysis.graph.ts'],
    },
    tone: 'professional and insightful',
    audience: 'engineering leaders and recruiters',
    errors: [],
  };

  const streamedChunks: string[] = [];
  const result = await runRepoAnalysisGraph(initialState, {
    onFinalContentChunk: (chunk) => {
      streamedChunks.push(chunk);
    },
  });

  if (streamedChunks.length > 0) {
    console.log(streamedChunks.join(''));
  }

  console.log(JSON.stringify(result, null, 2));
}

void run();
