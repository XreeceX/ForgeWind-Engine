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
    const readme =
      owner && repoName
        ? await this.fetchReadme(owner, repoName, repoData.metadata?.['accessToken'] as string | undefined)
        : '';
    const fileTree =
      owner && repoName
        ? await this.fetchTopLevelFiles(owner, repoName, repoData.metadata?.['accessToken'] as string | undefined)
        : [];

    return this.aiProvider.analyzeRepository({
      name: repoData.name,
      fullName: repoData.fullName ?? repoData.name,
      description: repoData.description ?? '',
      primaryLanguage: repoData.language ?? 'unknown',
      readme,
      files: fileTree,
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
}
