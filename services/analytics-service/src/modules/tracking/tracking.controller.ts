import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { EventTrackerService } from './services/event-tracker.service';
import { MetricsService } from './services/metrics.service';
import { TrackEventDto, GetEventsQueryDto } from '../../common/dto';

@ApiTags('Tracking')
@Controller('tracking')
export class TrackingController {
  constructor(
    private readonly eventTracker: EventTrackerService,
    private readonly metricsService: MetricsService,
  ) {}

  @Post('events')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Track a user event' })
  @ApiResponse({ status: 201, description: 'Event tracked successfully' })
  async trackEvent(@Body() dto: TrackEventDto) {
    const event = await this.eventTracker.trackEvent(
      dto.userId,
      dto.eventType,
      dto.action,
      dto.metadata ?? {},
    );
    return { success: true, event };
  }

  @Get('events')
  @ApiOperation({ summary: 'Get events for a user with optional filters' })
  @ApiResponse({ status: 200, description: 'Events retrieved' })
  async getEvents(@Query() query: GetEventsQueryDto) {
    const events = await this.eventTracker.getEvents(query.userId, {
      eventType: query.eventType,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      action: query.action,
    });
    return { events, total: events.length };
  }

  @Get('metrics/:userId')
  @ApiOperation({ summary: 'Get comprehensive metrics for a user' })
  @ApiParam({ name: 'userId', description: 'Target user ID' })
  @ApiResponse({ status: 200, description: 'User metrics calculated' })
  async getUserMetrics(@Param('userId') userId: string) {
    const metrics = await this.metricsService.calculateUserMetrics(userId);
    return { metrics };
  }
}
