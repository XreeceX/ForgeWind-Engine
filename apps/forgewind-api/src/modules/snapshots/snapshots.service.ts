import {
  BadGatewayException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, desc, eq } from 'drizzle-orm';
import { repoSnapshots, repositories, type AppDb } from '../../db';
import { DRIZZLE_DB } from '../database/database.constants';

type GitHubContributor = { login?: string; contributions?: number };
type GitHubCommit = { commit?: { author?: { date?: string } } };

@Injectable()
export class SnapshotsService {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: AppDb,
    private readonly config: ConfigService,
  ) {}

  private githubHeaders(): Record<string, string> {
    const token = this.config.get<string>('GITHUB_TOKEN');
    return {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private async githubJson<T>(url: string): Promise<T> {
    const res = await fetch(url, { headers: this.githubHeaders() });
    if (!res.ok) {
      const body = await res.text();
      throw new BadGatewayException(
        `GitHub request failed (${res.status}): ${body.slice(0, 500)}`,
      );
    }
    return res.json() as Promise<T>;
  }

  private parseOwnerRepo(fullName: string): [string, string] {
    const [owner, repo, ...rest] = fullName.split('/');
    if (!owner || !repo || rest.length > 0) {
      throw new BadGatewayException(`Invalid full_name: ${fullName}`);
    }
    return [owner, repo];
  }

  private computeScores(params: {
    commitCount30d: number;
    topLanguages: Record<string, number>;
    contributors: Array<{ login: string; commits: number }>;
  }): { focusScore: string; healthScore: string } {
    const langKeys = Object.keys(params.topLanguages).length;
    const contribCount = params.contributors.length;
    const commits = params.commitCount30d;

    const focusRaw =
      Math.min(commits * 2.2, 55) +
      Math.min(langKeys * 12, 25) +
      Math.min(contribCount * 6, 20);
    const healthRaw =
      Math.min(commits * 1.8, 45) +
      Math.min(contribCount * 10, 35) +
      Math.min(langKeys * 8, 20);

    const focusScore = Math.min(100, Math.round(focusRaw * 100) / 100).toFixed(2);
    const healthScore = Math.min(100, Math.round(healthRaw * 100) / 100).toFixed(2);

    return { focusScore, healthScore };
  }

  private async assertRepoForUser(userId: string, repoId: string) {
    const row = await this.db.query.repositories.findFirst({
      where: and(
        eq(repositories.id, repoId),
        eq(repositories.userId, userId),
      ),
    });
    if (!row) {
      throw new NotFoundException(`Repository ${repoId} not found`);
    }
    return row;
  }

  async syncRepository(userId: string, repoId: string) {
    const repo = await this.assertRepoForUser(userId, repoId);
    const [owner, name] = this.parseOwnerRepo(repo.fullName);
    const base = `https://api.github.com/repos/${owner}/${name}`;

    const since = new Date();
    since.setUTCDate(since.getUTCDate() - 30);
    const sinceIso = since.toISOString();

    const [languages, contributors, commitsPage] = await Promise.all([
      this.githubJson<Record<string, number>>(`${base}/languages`),
      this.githubJson<GitHubContributor[]>(
        `${base}/contributors?per_page=10&anon=false`,
      ),
      this.githubJson<GitHubCommit[]>(
        `${base}/commits?since=${encodeURIComponent(sinceIso)}&per_page=100`,
      ),
    ]);

    const commitCount30d = Array.isArray(commitsPage) ? commitsPage.length : 0;

    const topLanguages = languages ?? {};
    const contributorsNorm = (contributors ?? [])
      .filter((c) => c.login && typeof c.contributions === 'number')
      .map((c) => ({
        login: c.login as string,
        commits: c.contributions as number,
      }));

    const { focusScore, healthScore } = this.computeScores({
      commitCount30d,
      topLanguages,
      contributors: contributorsNorm,
    });

    const rawSignal = {
      languages,
      contributors: contributors ?? [],
      commitsSample: commitsPage ?? [],
      fetchedAt: new Date().toISOString(),
    };

    const [snapshot] = await this.db
      .insert(repoSnapshots)
      .values({
        repoId,
        commitCount30d,
        topLanguages,
        contributors: contributorsNorm,
        focusScore,
        healthScore,
        rawSignal,
      })
      .returning();

    await this.db
      .update(repositories)
      .set({ lastSyncedAt: new Date() })
      .where(eq(repositories.id, repoId));

    return snapshot!;
  }

  async listSnapshots(userId: string, repoId: string) {
    await this.assertRepoForUser(userId, repoId);

    return this.db.query.repoSnapshots.findMany({
      where: eq(repoSnapshots.repoId, repoId),
      orderBy: [desc(repoSnapshots.capturedAt)],
    });
  }
}
