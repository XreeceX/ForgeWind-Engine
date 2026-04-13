import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { Request } from 'express';
import { randomUUID } from 'crypto';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: null;
  metadata: {
    requestId: string;
    timestamp: string;
    version: string;
  };
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    const requestId =
      (request.headers['x-request-id'] as string) ?? randomUUID();

    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        error: null,
        metadata: {
          requestId,
          timestamp: new Date().toISOString(),
          version: '0.1.0',
        },
      })),
    );
  }
}
