import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { EventBusService } from './event-bus.service';
import { Phase2EventType } from './event-types';

interface RepoSelectedPayload {
  userId: string;
  repositoryIds: string[];
  repos: Array<{
    id: string;
    userId: string;
    name: string;
    description: string | null;
    language: string | null;
    stars: number;
    metadata: unknown;
  }>;
}

interface RepoAnalyzedPayload {
  userId: string;
  analyses: unknown[];
}

@Injectable()
export class RepoEventsOrchestrator implements OnModuleInit {
  private readonly logger = new Logger(RepoEventsOrchestrator.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  onModuleInit(): void {
    this.eventBus.subscribe<RepoSelectedPayload>(
      Phase2EventType.REPO_SELECTED,
      async (payload) => {
        await this.handleRepoSelected(payload);
      },
    );

    this.eventBus.subscribe<RepoAnalyzedPayload>(
      Phase2EventType.REPO_ANALYZED,
      async (payload) => {
        await this.handleRepoAnalyzed(payload);
      },
    );
  }

  private async handleRepoSelected(payload: RepoSelectedPayload): Promise<void> {
    const analysisServiceUrl = this.configService.get<string>(
      'REPO_ANALYSIS_SERVICE_URL',
      'http://localhost:4011/api/v1',
    );

    try {
      const response = await lastValueFrom(
        this.httpService.post<{ analyses: unknown[] }>(
          `${analysisServiceUrl}/analyze-repo`,
          {
            userId: payload.userId,
            repositoryIds: payload.repositoryIds,
            repos: payload.repos,
          },
        ),
      );

      this.eventBus.publish({
        type: Phase2EventType.REPO_ANALYZED,
        payload: {
          userId: payload.userId,
          analyses: response.data?.analyses ?? [],
        },
      });
    } catch (error) {
      this.logger.warn(
        `Failed REPO_SELECTED orchestration: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
    }
  }

  private async handleRepoAnalyzed(payload: RepoAnalyzedPayload): Promise<void> {
    const contentServiceUrl = this.configService.get<string>(
      'CONTENT_SERVICE_URL',
      'http://localhost:4012/api/v1',
    );

    try {
      await lastValueFrom(
        this.httpService.post(`${contentServiceUrl}/generate/post`, {
          source: 'repo-analysis',
          tone: 'professional',
          audience: 'hiring-managers',
          context: payload.analyses,
        }),
      );

      this.eventBus.publish({
        type: Phase2EventType.CONTENT_REQUESTED,
        payload: {
          userId: payload.userId,
          count: payload.analyses.length,
        },
      });
    } catch (error) {
      this.logger.warn(
        `Failed REPO_ANALYZED orchestration: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
    }
  }
}
