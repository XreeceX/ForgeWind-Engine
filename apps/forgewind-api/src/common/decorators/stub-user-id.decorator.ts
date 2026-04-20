import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';

export const StubUserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
    }>();
    const raw = request.headers['x-user-id'];
    const userId = Array.isArray(raw) ? raw[0] : raw;
    if (!userId?.trim()) {
      throw new BadRequestException('Missing or empty X-User-Id header');
    }
    return userId.trim();
  },
);
