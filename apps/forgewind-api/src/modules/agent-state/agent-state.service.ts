import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { agentState, repositories, type AppDb } from '../../db';
import { DRIZZLE_DB } from '../database/database.constants';
import type { PatchAgentStateDto } from './agent-state.dto';

@Injectable()
export class AgentStateService {
  constructor(@Inject(DRIZZLE_DB) private readonly db: AppDb) {}

  async ensureRow(userId: string) {
    await this.db
      .insert(agentState)
      .values({ userId })
      .onConflictDoNothing({ target: agentState.userId });

    const row = await this.db.query.agentState.findFirst({
      where: eq(agentState.userId, userId),
    });
    if (!row) {
      throw new NotFoundException(`Agent state for user ${userId} not found`);
    }
    return row;
  }

  async getForUser(userId: string) {
    return this.ensureRow(userId);
  }

  async patch(userId: string, dto: PatchAgentStateDto) {
    await this.ensureRow(userId);

    if (typeof dto.activeRepoId === 'string') {
      const repo = await this.db.query.repositories.findFirst({
        where: eq(repositories.id, dto.activeRepoId),
      });
      if (!repo || repo.userId !== userId) {
        throw new NotFoundException(`Repository ${dto.activeRepoId} not found`);
      }
    }

    const patch: {
      mode?: (typeof agentState.$inferInsert)['mode'];
      agentStatus?: (typeof agentState.$inferInsert)['agentStatus'];
      lastAction?: string | null;
      activeRepoId?: string | null;
      updatedAt: Date;
    } = { updatedAt: new Date() };

    if (dto.mode !== undefined) patch.mode = dto.mode;
    if (dto.agentStatus !== undefined) patch.agentStatus = dto.agentStatus;
    if (dto.lastAction !== undefined) patch.lastAction = dto.lastAction;
    if (dto.activeRepoId !== undefined) patch.activeRepoId = dto.activeRepoId;

    const hasFieldUpdate =
      dto.mode !== undefined ||
      dto.agentStatus !== undefined ||
      dto.lastAction !== undefined ||
      dto.activeRepoId !== undefined;

    if (hasFieldUpdate) {
      await this.db
        .update(agentState)
        .set(patch)
        .where(eq(agentState.userId, userId));
    }

    return this.ensureRow(userId);
  }
}
