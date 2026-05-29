import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProfileProxyService {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  private get userServiceUrl(): string {
    return this.config.get<string>('USER_SERVICE_URL', 'http://localhost:4001');
  }

  private get jobServiceUrl(): string {
    return this.config.get<string>('JOB_SERVICE_URL', 'http://localhost:4004');
  }

  async getProfile(externalUserId: string, authorization?: string) {
    try {
      const response = await firstValueFrom(
        this.http.get(`${this.userServiceUrl}/api/v1/users/me`, {
          headers: authorization ? { Authorization: authorization } : undefined,
        }),
      );
      return response.data;
    } catch {
      try {
        const fallback = await firstValueFrom(
          this.http.get(`${this.userServiceUrl}/api/v1/users/${externalUserId}`),
        );
        return fallback.data;
      } catch (error) {
        throw new ServiceUnavailableException(
          `User service unavailable: ${error instanceof Error ? error.message : 'unknown error'}`,
        );
      }
    }
  }

  async searchJobs(params: { query: string; page: number; limit: number }) {
    try {
      const response = await firstValueFrom(
        this.http.get(`${this.jobServiceUrl}/api/v1/jobs`, {
          params: {
            query: params.query,
            page: params.page,
            limit: params.limit,
          },
        }),
      );
      return response.data;
    } catch (error) {
      throw new ServiceUnavailableException(
        `Job service unavailable: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
    }
  }
}
