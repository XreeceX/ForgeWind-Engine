import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './services/jobs.service';
import { JobAggregatorService } from './services/job-aggregator.service';
import { JobSearchService } from './services/job-search.service';

@Module({
  controllers: [JobsController],
  providers: [JobsService, JobAggregatorService, JobSearchService],
  exports: [JobsService, JobAggregatorService],
})
export class JobsModule {}
