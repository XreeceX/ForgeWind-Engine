import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

@Injectable()
export class TokenCipherService {
  constructor(private readonly configService: ConfigService) {}

  encrypt(rawToken: string): string {
    const key = this.resolveKey();
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(rawToken, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
  }

  decrypt(encryptedToken: string): string {
    const key = this.resolveKey();
    const [ivHex, authTagHex, dataHex] = encryptedToken.split(':');

    if (!ivHex || !authTagHex || !dataHex) {
      throw new InternalServerErrorException('Invalid encrypted token format');
    }

    const decipher = createDecipheriv(
      'aes-256-gcm',
      key,
      Buffer.from(ivHex, 'hex'),
    );
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(dataHex, 'hex')),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  }

  private resolveKey(): Buffer {
    const keyHex = this.configService.get<string>('GITHUB_TOKEN_ENCRYPTION_KEY', '');
    if (!keyHex || keyHex.length !== 64) {
      throw new InternalServerErrorException(
        'GITHUB_TOKEN_ENCRYPTION_KEY must be a 64-char hex string',
      );
    }

    return Buffer.from(keyHex, 'hex');
  }
}
