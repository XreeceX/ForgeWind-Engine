import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { repositories, type AppDb } from '../../db';
import { DRIZZLE_DB } from '../database/database.constants';
import { SnapshotsService } from '../snapshots/snapshots.service';
import type { ConnectRepositoryDto } from './repositories.dto';

@Injectable()
export class RepositoriesService {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: AppDb,
    private readonly snapshots: SnapshotsService,
  ) {}

  async connect(userId: string, dto: ConnectRepositoryDto) {
    const [repo] = await this.db
      .insert(repositories)
      .values({
        userId,
        githubRepoId: dto.githubRepoId,
        name: dto.name,
        fullName: dto.fullName,
        description: dto.description ?? null,
        language: dto.language,
      })
      .returning();

    await this.snapshots.syncRepository(userId, repo!.id);
    return repo!;
  }

  async listForUser(userId: string) {
    return this.db.query.repositories.findMany({
      where: eq(repositories.userId, userId),
      orderBy: (r, { desc }) => [desc(r.connectedAt)],
    });
  }

  async disconnect(userId: string, repositoryId: string) {
    const deleted = await this.db
      .delete(repositories)
      .where(
        and(eq(repositories.id, repositoryId), eq(repositories.userId, userId)),
      )
      .returning({ id: repositories.id });

    if (deleted.length === 0) {
      throw new NotFoundException(`Repository ${repositoryId} not found`);
    }
  }

  async setActive(userId: string, repositoryId: string, isActive: boolean) {
    await this.assertOwned(userId, repositoryId);

    if (isActive) {
      await this.db
        .update(repositories)
        .set({ isActive: false })
        .where(eq(repositories.userId, userId));

      await this.db
        .update(repositories)
        .set({ isActive: true })
        .where(
          and(eq(repositories.id, repositoryId), eq(repositories.userId, userId)),
        );
    } else {
      await this.db
        .update(repositories)
        .set({ isActive: false })
        .where(
          and(eq(repositories.id, repositoryId), eq(repositories.userId, userId)),
        );
    }

    const [row] = await this.db
      .select()
      .from(repositories)
      .where(eq(repositories.id, repositoryId));
    return row!;
  }

  async assertOwned(userId: string, repositoryId: string) {
    const row = await this.db.query.repositories.findFirst({
      where: and(
        eq(repositories.id, repositoryId),
        eq(repositories.userId, userId),
      ),
    });
    if (!row) {
      throw new NotFoundException(`Repository ${repositoryId} not found`);
    }
    return row;
  }
}
