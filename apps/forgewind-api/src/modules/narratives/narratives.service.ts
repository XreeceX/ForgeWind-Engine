import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, desc, eq } from 'drizzle-orm';
import { narratives, repoSnapshots, repositories, users, type AppDb } from '../../db';
import { DRIZZLE_DB } from '../database/database.constants';
import { AnthropicService } from '../ai/anthropic.service';
import type { GenerateNarrativeDto, NarrativeType } from './narratives.dto';

type SnapshotContext = {
  commitCount30d: number;
  topLanguages: Record<string, number>;
  contributors: Array<{ login: string; commits: number }>;
  healthScore: string;
  focusScore: string;
};

type BuildPromptContext = {
  username: string;
  repo?: string;
  snapshot?: SnapshotContext;
};

@Injectable()
export class NarrativesService {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: AppDb,
    private readonly config: ConfigService,
    private readonly anthropic: AnthropicService,
  ) {}

  private buildPrompt(type: NarrativeType, context: BuildPromptContext): string {
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

      case 'profile_optimization': {
        const repoContext = context.repo
          ? `They have a connected repository: ${context.repo}.`
          : 'No specific repository connected.';
        return (
          `You are a professional career coach specialising in developer profiles. ` +
          `Generate a profile optimisation report for developer "${who}". ${repoContext}\n\n` +
          `Return ONLY plain text with exactly three sections, each prefixed with the label:\n` +
          `HEADLINE: A punchy professional headline (max 15 words).\n` +
          `IMPROVEMENT 1: First concrete improvement they should make to their profile.\n` +
          `IMPROVEMENT 2: Second concrete improvement they should make to their profile.\n` +
          `IMPROVEMENT 3: Third concrete improvement they should make to their profile.\n\n` +
          `Be specific and actionable. No markdown, no bullet points, just the labelled lines.`
        );
      }

      case 'skill_analysis': {
        if (!context.snapshot) {
          return (
            `Provide a general skill analysis for developer "${who}" based on their GitHub presence. ` +
            `List 6 common full-stack skills with estimated proficiency (Beginner/Intermediate/Advanced/Expert), ` +
            `3 gaps vs senior market demand, and 2 learning priorities. Plain text, no markdown.`
          );
        }
        const snap = context.snapshot;
        const langs = Object.entries(snap.topLanguages)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([lang, bytes]) => `${lang} (${Math.round(bytes / 1000)}k bytes)`)
          .join(', ');
        const contribCount = snap.contributors.length;
        return (
          `You are an expert technical recruiter analysing a developer's skill profile.\n\n` +
          `Developer: "${who}"\n` +
          `Repository: ${context.repo ?? 'unknown'}\n` +
          `Commits in last 30 days: ${snap.commitCount30d}\n` +
          `Top languages by bytes: ${langs || 'not available'}\n` +
          `Contributors: ${contribCount}\n` +
          `Health score: ${snap.healthScore}/100, Focus score: ${snap.focusScore}/100\n\n` +
          `Based on this data, produce a plain-text skill analysis with exactly these sections:\n` +
          `DETECTED SKILLS: List 6–8 skills detected with proficiency level (Beginner/Intermediate/Advanced/Expert).\n` +
          `SKILL GAPS: List 3 gaps vs senior full-stack market demand with a one-line explanation each.\n` +
          `LEARNING PRIORITIES: 2 specific technologies or skills to learn next, with a reason.\n\n` +
          `Be specific to the languages and activity shown. No markdown, no bullet symbols.`
        );
      }

      default: {
        const _exhaustive: never = type;
        return _exhaustive;
      }
    }
  }

  async generate(stubUserId: string, dto: GenerateNarrativeDto) {
    if (dto.userId !== stubUserId) {
      throw new BadRequestException('userId must match authenticated user');
    }

    const user = await this.db.query.users.findFirst({
      where: eq(users.id, dto.userId),
    });
    if (!user) {
      throw new NotFoundException(`User ${dto.userId} not found`);
    }

    let repoFullName: string | undefined;
    let snapshot: SnapshotContext | undefined;

    if (dto.repoId) {
      const repo = await this.db.query.repositories.findFirst({
        where: and(eq(repositories.id, dto.repoId), eq(repositories.userId, dto.userId)),
      });
      if (!repo) {
        throw new NotFoundException(`Repository ${dto.repoId} not found`);
      }
      repoFullName = repo.fullName;

      if (dto.type === 'skill_analysis') {
        const latestSnapshot = await this.db.query.repoSnapshots.findFirst({
          where: eq(repoSnapshots.repoId, dto.repoId),
          orderBy: [desc(repoSnapshots.capturedAt)],
        });
        if (latestSnapshot) {
          snapshot = {
            commitCount30d: latestSnapshot.commitCount30d,
            topLanguages: latestSnapshot.topLanguages,
            contributors: latestSnapshot.contributors,
            healthScore: latestSnapshot.healthScore,
            focusScore: latestSnapshot.focusScore,
          };
        }
      }
    }

    const prompt = this.buildPrompt(dto.type, {
      username: user.username,
      repo: repoFullName,
      snapshot,
    });

    const content = await this.anthropic.complete(prompt);

    const [row] = await this.db
      .insert(narratives)
      .values({
        userId: dto.userId,
        repoId: dto.repoId ?? null,
        type: dto.type,
        content,
        modelVersion: this.anthropic.modelVersion,
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
