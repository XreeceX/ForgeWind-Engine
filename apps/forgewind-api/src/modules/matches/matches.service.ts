import { Inject, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import { opportunityMatches, repoSnapshots, repositories, users, type AppDb } from '../../db';
import { DRIZZLE_DB } from '../database/database.constants';
import { AnthropicService } from '../ai/anthropic.service';
import type { MatchStatusUpdate } from './matches.dto';

type GeneratedMatch = {
  title: string;
  company: string;
  location: string;
  matchScore: number;
  reason: string;
};

@Injectable()
export class MatchesService {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: AppDb,
    private readonly anthropic: AnthropicService,
  ) {}

  async listForUser(userId: string) {
    return this.db.query.opportunityMatches.findMany({
      where: eq(opportunityMatches.userId, userId),
      orderBy: [desc(opportunityMatches.surfacedAt)],
    });
  }

  async updateStatus(userId: string, matchId: string, status: MatchStatusUpdate) {
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

  async generate(userId: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    const userRepos = await this.db.query.repositories.findMany({
      where: eq(repositories.userId, userId),
    });

    if (userRepos.length === 0) {
      throw new NotFoundException('No repositories connected. Connect a repository first.');
    }

    // Build context from repos + their latest snapshots
    const repoContextLines: string[] = [];
    for (const repo of userRepos.slice(0, 5)) {
      const snapshot = await this.db.query.repoSnapshots.findFirst({
        where: eq(repoSnapshots.repoId, repo.id),
        orderBy: [desc(repoSnapshots.capturedAt)],
      });

      const langs = snapshot
        ? Object.keys(snapshot.topLanguages).slice(0, 4).join(', ')
        : repo.language;

      const health = snapshot ? `health ${snapshot.healthScore}/100` : 'not yet synced';
      const commits = snapshot ? `${snapshot.commitCount30d} commits/30d` : '';

      repoContextLines.push(
        `- ${repo.fullName}: languages [${langs}], ${health}${commits ? `, ${commits}` : ''}`,
      );
    }

    const prompt = `You are a technical recruiter AI. Based on this developer's GitHub repository activity, generate exactly 3 job opportunity recommendations.

Developer: "${user.username}"
Repositories:
${repoContextLines.join('\n')}

Return ONLY a valid JSON array with exactly 3 objects. Each object must have these exact keys:
- "title": specific job title (e.g. "Senior Backend Engineer", "Staff Platform Engineer")
- "company": a realistic technology company name (do not use placeholder names)
- "location": city or "Remote" or "Hybrid"
- "matchScore": integer between 70 and 97
- "reason": one sentence explaining why this is a strong match based on the repository data above

Return only the JSON array, no other text, no markdown code blocks.`;

    const raw = await this.anthropic.complete(prompt, 800);

    let parsed: GeneratedMatch[];
    try {
      // Strip any accidental markdown fences
      const clean = raw
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```\s*$/, '')
        .trim();
      parsed = JSON.parse(clean) as GeneratedMatch[];
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error('Empty array');
      }
    } catch {
      throw new ServiceUnavailableException(
        'AI returned an unexpected format for job matches. Please try again.',
      );
    }

    const inserted = await this.db
      .insert(opportunityMatches)
      .values(
        parsed.map((m) => ({
          userId,
          title: String(m.title ?? 'Untitled Role'),
          source: 'ai_suggested' as const,
          matchScore: String(Math.min(100, Math.max(0, Number(m.matchScore) || 75))),
          matchedSignals: {
            company: m.company,
            location: m.location,
            reason: m.reason,
          } as Record<string, unknown>,
          url: null,
          status: 'new' as const,
        })),
      )
      .returning();

    return inserted;
  }
}
