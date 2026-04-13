import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JobsService } from './services/jobs.service';
import { SearchJobsDto, CreateJobDto } from '../../common/dto';
import { Job, PaginatedResult, MarketTrends } from '../../common/interfaces';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  async searchJobs(
    @Query() query: SearchJobsDto,
  ): Promise<PaginatedResult<Job>> {
    return this.jobsService.findAll({
      query: query.query ?? '',
      location: query.location,
      jobType: query.jobType,
      experienceLevel: query.experienceLevel,
      remote: query.remote,
      salaryMin: query.salaryMin,
      salaryMax: query.salaryMax,
      page: query.page,
      limit: query.limit,
    });
  }

  @Get('trends')
  async getMarketTrends(): Promise<MarketTrends> {
    return this.jobsService.getMarketTrends();
  }

  @Get(':id')
  async getJob(@Param('id') id: string): Promise<Job> {
    return this.jobsService.getById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createJob(@Body() dto: CreateJobDto): Promise<Job> {
    return this.jobsService.create(dto);
  }
}
