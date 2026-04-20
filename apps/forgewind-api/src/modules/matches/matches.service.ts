import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import { opportunityMatches, type AppDb } from '../../db';
import { DRIZZLE_DB } from '../database/database.constants';
import type { MatchStatusUpdate } from './matches.dto';

@Injectable()
export class MatchesService {
  constructor(@Inject(DRIZZLE_DB) private readonly db: AppDb) {}

  async listForUser(userId: string) {
    return this.db.query.opportunityMatches.findMany({
      where: eq(opportunityMatches.userId, userId),
      orderBy: [desc(opportunityMatches.surfacedAt)],
    });
  }

  async updateStatus(
    userId: string,
    matchId: string,
    status: MatchStatusUpdate,
  ) {
    const existing = await this.db.query.opportunityMatches.findFirst({
      where: eq(opportunityMatches.id, matchId),
    });
    if (!existing || existing.userId !== userId) {
      throw new NotFoundException(`Match ${matchId} not found`);
    }

    const [row] = await this.db
      .update(opportunityMatches)
      .set({ status })
      .where(eq(opportunityMatches.id, matchId))
      .returning();

    return row!;
  }
}
