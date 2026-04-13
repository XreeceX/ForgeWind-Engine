import { Module } from '@nestjs/common';
import { SchedulerService } from './services/scheduler.service';
import { SchedulingController } from './scheduling.controller';

@Module({
  controllers: [SchedulingController],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulingModule {}
