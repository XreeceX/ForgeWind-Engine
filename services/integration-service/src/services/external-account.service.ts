import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { TokenCipherService } from './token-cipher.service';

@Injectable()
export class ExternalAccountService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenCipher: TokenCipherService,
  ) {}

  async upsertGithubToken(userId: string, accessToken: string): Promise<void> {
    const encrypted = this.tokenCipher.encrypt(accessToken);

    await this.prisma.externalAccount.upsert({
      where: {
        userId_provider: {
          userId,
          provider: 'github',
        },
      },
      create: {
        userId,
        provider: 'github',
        accessToken: encrypted,
      },
      update: {
        accessToken: encrypted,
      },
    });
  }

  async getGithubToken(userId: string): Promise<string | null> {
    const account = await this.prisma.externalAccount.findUnique({
      where: {
        userId_provider: {
          userId,
          provider: 'github',
        },
      },
    });

    if (!account) {
      return null;
    }

    return this.tokenCipher.decrypt(account.accessToken);
  }
}
