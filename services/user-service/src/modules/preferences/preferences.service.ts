import { Injectable, NotFoundException } from '@nestjs/common';
import { UserPreference } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';
import { UpdatePreferencesDto } from './dto';

@Injectable()
export class PreferencesService {
  constructor(private readonly prisma: PrismaService) {}

  async get(userId: string): Promise<UserPreference> {
    await this.ensureUserExists(userId);

    const preferences = await this.prisma.userPreference.findUnique({
      where: { userId },
    });

    if (!preferences) {
      return this.prisma.userPreference.create({
        data: { userId },
      });
    }

    return preferences;
  }

  async update(
    userId: string,
    dto: UpdatePreferencesDto,
  ): Promise<UserPreference> {
    await this.ensureUserExists(userId);

    return this.prisma.userPreference.upsert({
      where: { userId },
      create: { userId, ...dto },
      update: dto,
    });
  }

  private async ensureUserExists(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }
  }
}
