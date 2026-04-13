import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TrackingModule } from './modules/tracking/tracking.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { ReportingModule } from './modules/reporting/reporting.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ScheduleModule.forRoot(),
    TrackingModule,
    FeedbackModule,
    ReportingModule,
  ],
})
export class AppModule {}
