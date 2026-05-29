import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { PrismaService } from '../../common/prisma.service';

describe('AuthService', () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };
  const jwt = {
    signAsync: jest.fn(),
    verify: jest.fn(),
  };
  const config = {
    getOrThrow: jest.fn((key: string) => {
      if (key === 'JWT_SECRET') return 'test-jwt-secret-minimum-32-characters';
      if (key === 'JWT_REFRESH_SECRET') return 'test-refresh-secret-minimum-32-chars';
      return '';
    }),
    get: jest.fn((_key: string, fallback?: string) => fallback),
  };

  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(
      prisma as unknown as PrismaService,
      jwt as unknown as JwtService,
      config as unknown as ConfigService,
    );
  });

  it('registers a new user and returns tokens', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'user-1',
      email: 'dev@example.com',
      passwordHash: 'hash',
      firstName: 'Dev',
      lastName: 'User',
      role: 'USER',
      authProviders: ['LOCAL'],
    });
    jwt.signAsync.mockResolvedValueOnce('access-token').mockResolvedValueOnce('refresh-token');

    const result = await service.register({
      email: 'dev@example.com',
      password: 'password123',
      firstName: 'Dev',
      lastName: 'User',
    });

    expect(result.tokens.accessToken).toBe('access-token');
    expect(result.user.email).toBe('dev@example.com');
  });

  it('rejects duplicate registration', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'existing' });

    await expect(
      service.register({
        email: 'dev@example.com',
        password: 'password123',
        firstName: 'Dev',
        lastName: 'User',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects invalid login credentials', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      service.login({ email: 'dev@example.com', password: 'wrong-password' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
