import {
  Controller,
  Get,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { GithubService } from '../services/github.service';

@Controller('github')
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @Get('auth')
  getAuthUrl(@Query('userId') userId: string): { authUrl: string } {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    return {
      authUrl: this.githubService.buildAuthUrl(userId),
    };
  }

  @Get('callback')
  async githubCallback(
    @Query('code') code: string,
    @Query('state') state: string,
  ): Promise<{ connected: boolean }> {
    if (!code || !state) {
      throw new BadRequestException('Missing OAuth callback parameters');
    }

    await this.githubService.processCallback(state, code);
    return { connected: true };
  }

  @Get('repos')
  async getRepos(@Query('userId') userId: string): Promise<unknown[]> {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    const repos = await this.githubService.getRepos(userId);
    return repos.map((repo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count,
      metadata: {
        owner: repo.owner.login,
        url: repo.html_url,
        updatedAt: repo.updated_at,
        fork: repo.fork,
      },
    }));
  }
}
