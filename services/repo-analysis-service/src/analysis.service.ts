import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { AiProvider, RepositoryInsight } from './ai-provider';

interface AnalyzeRepositoryInput {
  id?: string;
  fullName?: string;
  name: string;
  description?: string | null;
  language?: string | null;
  stars?: number | null;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AnalysisService {
  constructor(
    private readonly httpService: HttpService,
    private readonly aiProvider: AiProvider,
  ) {}

  async analyzeRepository(repoData: AnalyzeRepositoryInput): Promise<RepositoryInsight> {
    const [owner, repoName] = (repoData.fullName ?? '').split('/');
    const accessToken = repoData.metadata?.['accessToken'] as string | undefined;
    const readme =
      owner && repoName
        ? await this.fetchReadme(owner, repoName, accessToken)
        : '';
    const fileTree =
      owner && repoName
        ? await this.fetchTopLevelFiles(owner, repoName, accessToken)
        : [];
    const [languages, repoMeta] =
      owner && repoName
        ? await Promise.all([
            this.fetchLanguages(owner, repoName, accessToken),
            this.fetchRepositoryMeta(owner, repoName, accessToken),
          ])
        : [[], null];
    const commits =
      owner && repoName && repoMeta?.defaultBranch
        ? await this.fetchCommitCount(owner, repoName, repoMeta.defaultBranch, accessToken)
        : 0;
    const normalizedLanguages = [
      ...(repoData.language ? [repoData.language] : []),
      ...languages,
    ].filter((value, index, array) => !!value && array.indexOf(value) === index);

    return this.aiProvider.analyzeRepository({
      name: repoData.name,
      fullName: repoData.fullName ?? repoData.name,
      description: repoData.description ?? '',
      readme,
      languages: normalizedLanguages,
      stars: repoData.stars ?? repoMeta?.stars ?? 0,
      commits,
      fileTreeSummary: this.summarizeFileTree(fileTree),
      keyFiles: this.extractKeyFiles(fileTree),
      includeDifferentiationScore: Boolean(
        repoData.metadata?.['advancedMode'] ?? repoData.metadata?.['includeDifferentiationScore'],
      ),
      tone: String(repoData.metadata?.['tone'] ?? 'professional'),
      audience: String(repoData.metadata?.['audience'] ?? 'hiring managers'),
    });
  }

  private async fetchReadme(
    owner: string,
    repo: string,
    accessToken?: string,
  ): Promise<string> {
    try {
      const response = await lastValueFrom(
        this.httpService.get<{ content?: string }>(
          `https://api.github.com/repos/${owner}/${repo}/readme`,
          {
            headers: this.buildHeaders(accessToken),
          },
        ),
      );

      const content = response.data?.content ?? '';
      if (!content) {
        return '';
      }

      return Buffer.from(content, 'base64').toString('utf8').slice(0, 6000);
    } catch {
      return '';
    }
  }

  private async fetchTopLevelFiles(
    owner: string,
    repo: string,
    accessToken?: string,
  ): Promise<string[]> {
    try {
      const response = await lastValueFrom(
        this.httpService.get<{ tree?: Array<{ path: string }> }>(
          `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`,
          {
            headers: this.buildHeaders(accessToken),
          },
        ),
      );

      return (response.data?.tree ?? [])
        .slice(0, 120)
        .map((item) => item.path)
        .filter(Boolean);
    } catch {
      return [];
    }
  }

  private buildHeaders(accessToken?: string): Record<string, string> {
    return {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };
  }

  private async fetchLanguages(
    owner: string,
    repo: string,
    accessToken?: string,
  ): Promise<string[]> {
    try {
      const response = await lastValueFrom(
        this.httpService.get<Record<string, number>>(
          `https://api.github.com/repos/${owner}/${repo}/languages`,
          {
            headers: this.buildHeaders(accessToken),
          },
        ),
      );

      return Object.keys(response.data ?? {});
    } catch {
      return [];
    }
  }

  private async fetchRepositoryMeta(
    owner: string,
    repo: string,
    accessToken?: string,
  ): Promise<{ stars: number; defaultBranch: string } | null> {
    try {
      const response = await lastValueFrom(
        this.httpService.get<{ stargazers_count?: number; default_branch?: string }>(
          `https://api.github.com/repos/${owner}/${repo}`,
          {
            headers: this.buildHeaders(accessToken),
          },
        ),
      );

      return {
        stars: response.data?.stargazers_count ?? 0,
        defaultBranch: response.data?.default_branch ?? 'main',
      };
    } catch {
      return null;
    }
  }

  private async fetchCommitCount(
    owner: string,
    repo: string,
    defaultBranch: string,
    accessToken?: string,
  ): Promise<number> {
    try {
      const response = await lastValueFrom(
        this.httpService.get<Array<Record<string, unknown>>>(
          `https://api.github.com/repos/${owner}/${repo}/commits?sha=${defaultBranch}&per_page=1`,
          {
            headers: this.buildHeaders(accessToken),
          },
        ),
      );

      const linkHeader = String(response.headers?.['link'] ?? '');
      if (linkHeader) {
        const lastPageMatch = linkHeader.match(/[?&]page=(\d+)>; rel="last"/);
        if (lastPageMatch?.[1]) {
          return Number(lastPageMatch[1]);
        }
      }

      const commits = response.data ?? [];
      return commits.length > 0 ? 1 : 0;
    } catch {
      return 0;
    }
  }

  private summarizeFileTree(paths: string[]): string {
    if (paths.length === 0) {
      return 'No file tree available.';
    }

    const topLevelCounts = new Map<string, number>();
    for (const path of paths.slice(0, 500)) {
      const topLevel = path.split('/')[0] ?? path;
      topLevelCounts.set(topLevel, (topLevelCounts.get(topLevel) ?? 0) + 1);
    }

    const dominantAreas = [...topLevelCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => `${name}(${count})`)
      .join(', ');

    return `Repository has ${paths.length} indexed files. Top areas: ${dominantAreas}.`;
  }

  private extractKeyFiles(paths: string[]): string[] {
    const priorityPatterns = [
      /(^|\/)readme\.md$/i,
      /(^|\/)package\.json$/i,
      /(^|\/)dockerfile$/i,
      /(^|\/)docker-compose\.ya?ml$/i,
      /(^|\/)compose\.ya?ml$/i,
      /(^|\/)tsconfig\.json$/i,
      /(^|\/)requirements\.txt$/i,
      /(^|\/)pyproject\.toml$/i,
      /(^|\/)go\.mod$/i,
      /(^|\/)pom\.xml$/i,
      /(^|\/)main\.(ts|js|py|go)$/i,
      /(^|\/)app\.(ts|js|py)$/i,
    ];

    const selected = new Set<string>();
    for (const pattern of priorityPatterns) {
      const match = paths.find((path) => pattern.test(path));
      if (match) {
        selected.add(match);
      }
      if (selected.size >= 12) {
        break;
      }
    }

    for (const path of paths) {
      if (selected.size >= 12) {
        break;
      }
      if (
        !path.includes('node_modules') &&
        !path.includes('.next') &&
        !path.includes('dist/') &&
        !path.includes('build/')
      ) {
        selected.add(path);
      }
    }

    return [...selected];
  }
}
