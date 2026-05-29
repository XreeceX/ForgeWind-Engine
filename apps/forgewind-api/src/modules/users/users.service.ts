import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { agentState, repositories, users, type AppDb } from '../../db';
import { DRIZZLE_DB } from '../database/database.constants';
import type { UpsertUserDto } from './users.dto';

@Injectable()
export class UsersService {
  constructor(@Inject(DRIZZLE_DB) private readonly db: AppDb) {}

  async findOrCreateByExternalId(
    externalUserId: string,
    profile: { email?: string; firstName?: string; lastName?: string },
  ) {
    const existing = await this.db.query.users.findFirst({
      where: eq(users.externalUserId, externalUserId),
    });

    if (existing) {
      return existing;
    }

    const username =
      profile.email?.split('@')[0]?.slice(0, 39) ?? `user-${externalUserId.slice(0, 8)}`;
    const displayName = [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim();

    const [user] = await this.db
      .insert(users)
      .values({
        externalUserId,
        githubId: `local:${externalUserId}`,
        username: displayName || username,
        avatarUrl: 'https://avatars.githubusercontent.com/u/0?v=4',
        email: profile.email ?? null,
      })
      .returning();

    await this.db
      .insert(agentState)
      .values({ userId: user!.id })
      .onConflictDoNothing({ target: agentState.userId });

    return user!;
  }

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
