import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { agentState, repositories, users, type AppDb } from '../../db';
import { DRIZZLE_DB } from '../database/database.constants';
import type { UpsertUserDto } from './users.dto';

@Injectable()
export class UsersService {
  constructor(@Inject(DRIZZLE_DB) private readonly db: AppDb) {}

  async upsertFromGithub(dto: UpsertUserDto) {
    const [user] = await this.db
      .insert(users)
      .values({
        githubId: dto.githubId,
        username: dto.username,
        avatarUrl: dto.avatarUrl,
        email: dto.email ?? null,
      })
      .onConflictDoUpdate({
        target: users.githubId,
        set: {
          username: dto.username,
          avatarUrl: dto.avatarUrl,
          email: dto.email ?? null,
          updatedAt: new Date(),
        },
      })
      .returning();

    await this.db
      .insert(agentState)
      .values({ userId: user!.id })
      .onConflictDoNothing({ target: agentState.userId });

    return user!;
  }

  async findByIdWithRepos(id: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, id),
      with: {
        repositories: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    return user;
  }

  async assertOwnsRepository(userId: string, repositoryId: string) {
    const row = await this.db.query.repositories.findFirst({
      where: eq(repositories.id, repositoryId),
    });
    if (!row || row.userId !== userId) {
      throw new NotFoundException(`Repository ${repositoryId} not found`);
    }
    return row;
  }
}
