import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';

interface HealthStatus {
  status: 'ok' | 'degraded';
  uptime: number;
  version: string;
  timestamp: string;
  services: Record<string, 'up' | 'down' | 'unknown'>;
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  private readonly startTime = Date.now();

  @Get()
  @ApiOperation({ summary: 'Service health check' })
  @ApiOkResponse({ description: 'Service is healthy' })
  getHealth(): HealthStatus {
    // TODO: Ping downstream services to check actual health
    return {
      status: 'ok',
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      version: '0.1.0',
      timestamp: new Date().toISOString(),
      services: {
        userService: 'unknown',
        jobService: 'unknown',
        contentService: 'unknown',
        profileService: 'unknown',
        agentService: 'unknown',
      },
    };
  }
}
