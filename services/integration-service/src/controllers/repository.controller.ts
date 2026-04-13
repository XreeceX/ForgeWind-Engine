import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { z } from 'zod';
import { RepositoryService } from '../services/repository.service';
import { EventBusService } from '../events/event-bus.service';
import { Phase2EventType } from '../events/event-types';

const repoImportSchema = z.object({
  userId: z.string().min(1),
  repos: z.array(
    z.object({
      id: z.number().int(),
      name: z.string().min(1),
      fullName: z.string().min(1),
      description: z.string().nullable(),
      language: z.string().nullable(),
      stars: z.number().int().nonnegative().default(0),
      metadata: z.record(z.unknown()).default({}),
    }),
  ),
});

const repoSelectionSchema = z.object({
  userId: z.string().min(1),
  repositoryIds: z.array(z.string().min(1)).min(1),
});

@Controller('repositories')
export class RepositoryController {
  constructor(
    private readonly repositoryService: RepositoryService,
    private readonly eventBus: EventBusService,
  ) {}

  @Post('import')
  async importRepositories(@Body() body: unknown): Promise<{ imported: number }> {
    const parsed = repoImportSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    const records = await this.repositoryService.importRepositories(
      parsed.data.userId,
      parsed.data.repos,
    );

    return {
      imported: records.length,
    };
  }

  @Post('select')
  async selectRepositories(@Body() body: unknown): Promise<{ selected: number }> {
    const parsed = repoSelectionSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    await this.repositoryService.selectRepositories(
      parsed.data.userId,
      parsed.data.repositoryIds,
    );
    const selectedRepos = await this.repositoryService.getSelectedRepositories(
      parsed.data.userId,
    );

    this.eventBus.publish({
      type: Phase2EventType.REPO_SELECTED,
      payload: {
        userId: parsed.data.userId,
        repositoryIds: parsed.data.repositoryIds,
        repos: selectedRepos,
      },
    });

    return {
      selected: parsed.data.repositoryIds.length,
    };
  }
}
