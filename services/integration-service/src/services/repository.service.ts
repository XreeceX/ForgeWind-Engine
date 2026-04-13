import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { RepositoryImportInput } from '../types/repository.types';
import { RepositoryEntity } from '../types/repository.entity';
import { Prisma, Repository } from '../generated/prisma';

@Injectable()
export class RepositoryService {
  constructor(private readonly prisma: PrismaService) {}

  async importRepositories(
    userId: string,
    repos: RepositoryImportInput[],
  ): Promise<RepositoryEntity[]> {
    const records: RepositoryEntity[] = [];

    for (const repo of repos) {
      const created = await this.prisma.repository.upsert({
        where: {
          userId_githubRepoId: {
            userId,
            githubRepoId: String(repo.id),
          },
        },
        create: {
          userId,
          githubRepoId: String(repo.id),
          name: repo.name,
          fullName: repo.fullName,
          description: repo.description,
          language: repo.language,
          stars: repo.stars,
          metadata: repo.metadata as Prisma.InputJsonValue,
        },
        update: {
          name: repo.name,
          fullName: repo.fullName,
          description: repo.description,
          language: repo.language,
          stars: repo.stars,
          metadata: repo.metadata as Prisma.InputJsonValue,
        },
      });

      records.push({
        id: created.id,
        userId: created.userId,
        name: created.name,
        description: created.description,
        language: created.language,
        stars: created.stars,
        metadata: created.metadata,
      });
    }

    return records;
  }

  async selectRepositories(userId: string, repositoryIds: string[]): Promise<void> {
    await this.prisma.repository.updateMany({
      where: {
        userId,
      },
      data: {
        isSelected: false,
      },
    });

    await this.prisma.repository.updateMany({
      where: {
        userId,
        githubRepoId: {
          in: repositoryIds,
        },
      },
      data: {
        isSelected: true,
      },
    });
  }

  async getSelectedRepositories(userId: string): Promise<RepositoryEntity[]> {
    const rows = await this.prisma.repository.findMany({
      where: {
        userId,
        isSelected: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return rows.map((row: Repository) => ({
      id: row.id,
      userId: row.userId,
      name: row.name,
      description: row.description,
      language: row.language,
      stars: row.stars,
      metadata: row.metadata,
    }));
  }
}
