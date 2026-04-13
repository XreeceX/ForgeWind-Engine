import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { GithubRepository, GithubTokenResponse } from '../types/github.types';

@Injectable()
export class GithubProvider {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  getAuthUrl(state: string): string {
    const clientId = this.configService.get<string>('GITHUB_CLIENT_ID', '');
    const redirectUri = this.configService.get<string>('GITHUB_REDIRECT_URI', '');
    const scope = this.configService.get<string>('GITHUB_SCOPE', 'repo read:user');

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope,
      state,
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string): Promise<string> {
    const clientId = this.configService.get<string>('GITHUB_CLIENT_ID', '');
    const clientSecret = this.configService.get<string>('GITHUB_CLIENT_SECRET', '');

    const response = await lastValueFrom(
      this.httpService.post<GithubTokenResponse>(
        'https://github.com/login/oauth/access_token',
        {
          client_id: clientId,
          client_secret: clientSecret,
          code,
        },
        {
          headers: {
            Accept: 'application/json',
          },
        },
      ),
    );

    const accessToken = response.data?.access_token;
    if (!accessToken) {
      throw new UnauthorizedException('Failed to exchange code for GitHub token');
    }

    return accessToken;
  }

  async fetchRepositories(accessToken: string): Promise<GithubRepository[]> {
    const response = await lastValueFrom(
      this.httpService.get<GithubRepository[]>(
        'https://api.github.com/user/repos?sort=updated&per_page=100',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
          },
        },
      ),
    );

    return response.data ?? [];
  }
}
