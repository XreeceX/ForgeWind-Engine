import { Module } from '@nestjs/common';
import { TrackingModule } from '../tracking/tracking.module';
import { FeedbackModule } from '../feedback/feedback.module';
import { ReportGeneratorService } from './services/report-generator.service';
import { ReportingController } from './reporting.controller';

@Module({
  imports: [TrackingModule, FeedbackModule],
  controllers: [ReportingController],
  providers: [ReportGeneratorService],
  exports: [ReportGeneratorService],
})
export class ReportingModule {}
