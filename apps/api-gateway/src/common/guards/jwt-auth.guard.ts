import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as crypto from 'crypto';

interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
  iat: number;
  exp: number;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing authentication token');
    }

    const payload = this.validateToken(token);
    (request as Request & { user: JwtPayload }).user = payload;
    return true;
  }

  private extractToken(request: Request): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.slice(7);
  }

  private validateToken(token: string): JwtPayload {
    // TODO: Replace with proper JWT verification via passport-jwt strategy
    // once the user-service is wired up. For now, decode and do basic validation.
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new UnauthorizedException('Malformed token');
      }

      const payloadRaw = Buffer.from(parts[1]!, 'base64url').toString('utf-8');
      const payload = JSON.parse(payloadRaw) as JwtPayload;

      const secret = this.configService.get<string>('gateway.jwt.secret');
      const expectedSig = crypto
        .createHmac('sha256', secret ?? 'dev-secret-change-me')
        .update(`${parts[0]}.${parts[1]}`)
        .digest('base64url');

      if (expectedSig !== parts[2]) {
        throw new UnauthorizedException('Invalid token signature');
      }

      if (payload.exp && payload.exp * 1000 < Date.now()) {
        throw new UnauthorizedException('Token expired');
      }

      return payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Invalid authentication token');
    }
  }
}
