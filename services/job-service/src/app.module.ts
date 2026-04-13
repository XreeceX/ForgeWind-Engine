import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { JobsModule } from './modules/jobs/jobs.module';
import { MatchingModule } from './modules/matching/matching.module';
import { TrackingModule } from './modules/tracking/tracking.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ScheduleModule.forRoot(),
    JobsModule,
    MatchingModule,
    TrackingModule,
  ],
})
export class AppModule {}
