import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, desc, eq } from 'drizzle-orm';
import { narratives, repositories, users, type AppDb } from '../../db';
import { DRIZZLE_DB } from '../database/database.constants';
import type { GenerateNarrativeDto, NarrativeType } from './narratives.dto';

@Injectable()
export class NarrativesService {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: AppDb,
    private readonly config: ConfigService,
  ) {}

  private buildPrompt(type: NarrativeType, context: { username: string; repo?: string }) {
    const who = context.username;
    const repoLine = context.repo
      ? `Repository context: ${context.repo}.`
      : 'No specific repository; profile-level narrative.';

    switch (type) {
      case 'bio':
        return `Write a concise professional bio (max 120 words) for developer "${who}". ${repoLine} No markdown, plain text.`;
      case 'project_summary':
        return `Summarize the project "${context.repo ?? 'their work'}" for "${who}" in 2 short paragraphs for recruiters. ${repoLine} Plain text, no markdown.`;
      case 'commit_story':
        return `Tell a short story (max 100 words) about "${who}"'s recent engineering momentum based on public GitHub activity. ${repoLine} Plain text, no markdown.`;
      default: {
        const _exhaustive: never = type;
        return _exhaustive;
      }
    }
  }

  private async anthropicComplete(prompt: string): Promise<string> {
    const apiKey = this.config.get<string>('ANTHROPIC_API_KEY');
    if (!apiKey) {
      throw new ServiceUnavailableException('ANTHROPIC_API_KEY is not configured');
    }

    const model =
      this.config.get<string>('ANTHROPIC_MODEL') ?? 'claude-3-5-sonnet-20241022';

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new ServiceUnavailableException(
        `Anthropic error (${res.status}): ${errText.slice(0, 400)}`,
      );
    }

    const data = (await res.json()) as {
      content?: Array<{ type?: string; text?: string }>;
    };
    const text = data.content?.find((c) => c.type === 'text')?.text?.trim();
    if (!text) {
      throw new ServiceUnavailableException('Anthropic returned an empty response');
    }
    return text;
  }

  async generate(stubUserId: string, dto: GenerateNarrativeDto) {
    if (dto.userId !== stubUserId) {
      throw new BadRequestException('userId must match X-User-Id header');
    }

    const user = await this.db.query.users.findFirst({
      where: eq(users.id, dto.userId),
    });
    if (!user) {
      throw new NotFoundException(`User ${dto.userId} not found`);
    }

    let repoFullName: string | undefined;
    if (dto.repoId) {
      const repo = await this.db.query.repositories.findFirst({
        where: and(
          eq(repositories.id, dto.repoId),
          eq(repositories.userId, dto.userId),
        ),
      });
      if (!repo) {
        throw new NotFoundException(`Repository ${dto.repoId} not found`);
      }
      repoFullName = repo.fullName;
    }

    const prompt = this.buildPrompt(dto.type, {
      username: user.username,
      repo: repoFullName,
    });

    const content = await this.anthropicComplete(prompt);
    const modelVersion =
      this.config.get<string>('ANTHROPIC_MODEL') ?? 'claude-3-5-sonnet-20241022';

    const [row] = await this.db
      .insert(narratives)
      .values({
        userId: dto.userId,
        repoId: dto.repoId ?? null,
        type: dto.type,
        content,
        modelVersion,
      })
      .returning();

    return row!;
  }

  async listForUser(userId: string, type?: NarrativeType) {
    return this.db.query.narratives.findMany({
      where: type
        ? and(eq(narratives.userId, userId), eq(narratives.type, type))
        : eq(narratives.userId, userId),
      orderBy: [desc(narratives.generatedAt)],
    });
  }

  async setPinned(userId: string, narrativeId: string, isPinned?: boolean) {
    const existing = await this.db.query.narratives.findFirst({
      where: and(eq(narratives.id, narrativeId), eq(narratives.userId, userId)),
    });
    if (!existing) {
      throw new NotFoundException(`Narrative ${narrativeId} not found`);
    }

    const nextPinned = isPinned ?? !existing.isPinned;

    const [row] = await this.db
      .update(narratives)
      .set({ isPinned: nextPinned })
      .where(eq(narratives.id, narrativeId))
      .returning();

    return row!;
  }
}
