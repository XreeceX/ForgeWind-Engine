import { Injectable, NotFoundException } from '@nestjs/common';
import { GithubProvider } from '../providers/github.provider';
import { ExternalAccountService } from './external-account.service';
import { GithubRepository } from '../types/github.types';

@Injectable()
export class GithubService {
  constructor(
    private readonly githubProvider: GithubProvider,
    private readonly externalAccountService: ExternalAccountService,
  ) {}

  buildAuthUrl(userId: string): string {
    return this.githubProvider.getAuthUrl(userId);
  }

  async processCallback(userId: string, code: string): Promise<void> {
    const accessToken = await this.githubProvider.exchangeCodeForToken(code);
    await this.externalAccountService.upsertGithubToken(userId, accessToken);
  }

  async getRepos(userId: string): Promise<GithubRepository[]> {
    const accessToken = await this.externalAccountService.getGithubToken(userId);
    if (!accessToken) {
      throw new NotFoundException('GitHub account not connected for this user');
    }

    return this.githubProvider.fetchRepositories(accessToken);
  }
}
