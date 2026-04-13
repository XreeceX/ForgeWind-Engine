import { Injectable, NotFoundException } from '@nestjs/common';
import { User, Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';
import { UpdateUserDto, UpdateCareerGoalsDto } from './dto';

type UserWithoutPassword = Omit<User, 'passwordHash'>;

const userSelectFields = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  avatarUrl: true,
  linkedinUrl: true,
  githubUrl: true,
  portfolioUrl: true,
  role: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
  authProviders: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<UserWithoutPassword> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: userSelectFields,
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<UserWithoutPassword | null> {
    return this.prisma.user.findUnique({
      where: { email },
      select: userSelectFields,
    });
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserWithoutPassword> {
    await this.ensureUserExists(id);

    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: userSelectFields,
    });
  }

  async updateCareerGoals(userId: string, dto: UpdateCareerGoalsDto) {
    await this.ensureUserExists(userId);

    return this.prisma.careerGoal.upsert({
      where: { userId },
      create: {
        userId,
        ...dto,
      },
      update: dto,
    });
  }

  async softDelete(id: string): Promise<UserWithoutPassword> {
    await this.ensureUserExists(id);

    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: userSelectFields,
    });
  }

  async getFullProfile(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        ...userSelectFields,
        careerGoals: true,
        preferences: true,
        resumes: true,
        applications: {
          orderBy: { updatedAt: 'desc' },
          take: 20,
        },
        linkedinProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    return user;
  }

  private async ensureUserExists(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
  }
}
