import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthProvider, User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../common/prisma.service';
import { RegisterDto, LoginDto, TokensDto } from './dto';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

interface OAuthProfile {
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  linkedinUrl?: string;
}

const SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(
    dto: RegisterDto,
  ): Promise<{ user: Omit<User, 'passwordHash'>; tokens: TokensDto }> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        linkedinUrl: dto.linkedinUrl,
        authProviders: [AuthProvider.LOCAL],
      },
    });

    const tokens = await this.generateTokens(user);
    const { passwordHash: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, tokens };
  }

  async login(dto: LoginDto): Promise<{ user: Omit<User, 'passwordHash'>; tokens: TokensDto }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens(user);
    const { passwordHash: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, tokens };
  }

  async refreshToken(refreshToken: string): Promise<TokensDto> {
    let payload: JwtPayload;

    try {
      payload = this.jwt.verify<JwtPayload>(refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or deactivated');
    }

    return this.generateTokens(user);
  }

  async validateOAuthUser(
    provider: AuthProvider,
    profile: OAuthProfile,
  ): Promise<{ user: Omit<User, 'passwordHash'>; tokens: TokensDto }> {
    let user = await this.prisma.user.findUnique({
      where: { email: profile.email },
    });

    if (user) {
      const providers = new Set(user.authProviders);
      if (!providers.has(provider)) {
        providers.add(provider);
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            authProviders: Array.from(providers),
            lastLoginAt: new Date(),
            avatarUrl: user.avatarUrl ?? profile.avatarUrl,
          },
        });
      } else {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });
      }
    } else {
      user = await this.prisma.user.create({
        data: {
          email: profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
          avatarUrl: profile.avatarUrl,
          linkedinUrl: profile.linkedinUrl,
          authProviders: [provider],
        },
      });
    }

    const tokens = await this.generateTokens(user);
    const { passwordHash: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, tokens };
  }

  async generateTokens(user: User): Promise<TokensDto> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessExpiry = this.config.get<string>('JWT_ACCESS_EXPIRY', '15m');
    const refreshExpiry = this.config.get<string>('JWT_REFRESH_EXPIRY', '7d');

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.getOrThrow<string>('JWT_SECRET'),
        expiresIn: accessExpiry as `${number}s` | `${number}m` | `${number}h` | `${number}d`,
      }),
      this.jwt.signAsync(payload, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: refreshExpiry as `${number}s` | `${number}m` | `${number}h` | `${number}d`,
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
