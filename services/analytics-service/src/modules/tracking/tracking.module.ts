import { Module } from '@nestjs/common';
import { EventTrackerService } from './services/event-tracker.service';
import { MetricsService } from './services/metrics.service';
import { TrackingController } from './tracking.controller';

@Module({
  controllers: [TrackingController],
  providers: [EventTrackerService, MetricsService],
  exports: [EventTrackerService, MetricsService],
})
export class TrackingModule {}
