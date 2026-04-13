import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  CurrentUser,
  AuthenticatedUser,
} from '../../common/decorators/current-user.decorator';
import {
  SearchJobsDto,
  TrackApplicationDto,
  UpdateApplicationDto,
  JobListing,
  JobMatch,
  ApplicationRecord,
  PaginatedResponse,
  JobType,
  JobExperienceLevel,
  ApplicationStatus,
} from './jobs.dto';

const STUB_JOB: JobListing = {
  id: 'job_001',
  title: 'Senior Frontend Engineer',
  company: 'Acme Corp',
  location: 'San Francisco, CA',
  remote: true,
  jobType: JobType.FULL_TIME,
  experienceLevel: JobExperienceLevel.SENIOR,
  salary: { min: 180000, max: 240000, currency: 'USD' },
  description: 'We are looking for a senior frontend engineer to lead our design system...',
  requirements: ['5+ years React', 'TypeScript', 'Design systems experience'],
  postedAt: new Date().toISOString(),
  url: 'https://example.com/jobs/001',
};

@ApiTags('Jobs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('jobs')
export class JobsController {
  @Get()
  @ApiOperation({ summary: 'Search and filter jobs' })
  @ApiOkResponse({ description: 'Paginated job listings' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  searchJobs(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: SearchJobsDto,
  ): PaginatedResponse<JobListing> {
    // TODO: Forward to job-service GET /jobs with query params
    void user;
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    return {
      items: [STUB_JOB],
      total: 1,
      page,
      limit,
      totalPages: 1,
    };
  }

  @Get('matches')
  @ApiOperation({ summary: 'Get AI-matched jobs for current user' })
  @ApiOkResponse({ description: 'Matched jobs with scores' })
  getMatches(
    @CurrentUser() user: AuthenticatedUser,
  ): JobMatch[] {
    // TODO: Forward to job-service GET /jobs/matches/:userId
    void user;
    return [
      {
        job: STUB_JOB,
        matchScore: 87,
        matchReasons: [
          'Strong React & TypeScript skills match',
          'Location preference matches',
          'Salary range aligns with goals',
        ],
        missingSkills: ['Design systems at scale'],
      },
    ];
  }

  @Get('applications')
  @ApiOperation({ summary: "List user's tracked applications" })
  @ApiOkResponse({ description: 'Application history' })
  getApplications(
    @CurrentUser() user: AuthenticatedUser,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): PaginatedResponse<ApplicationRecord> {
    // TODO: Forward to job-service GET /applications?userId=...
    void user;
    return {
      items: [
        {
          id: 'app_001',
          jobId: 'job_001',
          jobTitle: 'Senior Frontend Engineer',
          company: 'Acme Corp',
          status: ApplicationStatus.APPLIED,
          notes: 'Applied via website',
          appliedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      total: 1,
      page: page ?? 1,
      limit: limit ?? 20,
      totalPages: 1,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job detail by ID' })
  @ApiOkResponse({ description: 'Job details' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  getJob(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): JobListing {
    // TODO: Forward to job-service GET /jobs/:id
    void user;
    return { ...STUB_JOB, id };
  }

  @Post(':id/apply')
  @ApiOperation({ summary: 'Track a job application' })
  @ApiCreatedResponse({ description: 'Application tracked' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  trackApplication(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: TrackApplicationDto,
  ): ApplicationRecord {
    // TODO: Forward to job-service POST /jobs/:id/apply
    void user;
    return {
      id: 'app_new_001',
      jobId: id,
      jobTitle: 'Senior Frontend Engineer',
      company: 'Acme Corp',
      status: ApplicationStatus.APPLIED,
      notes: dto.notes ?? null,
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  @Patch('applications/:id')
  @ApiOperation({ summary: 'Update application status' })
  @ApiOkResponse({ description: 'Application updated' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  updateApplication(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateApplicationDto,
  ): ApplicationRecord {
    // TODO: Forward to job-service PATCH /applications/:id
    void user;
    return {
      id,
      jobId: 'job_001',
      jobTitle: 'Senior Frontend Engineer',
      company: 'Acme Corp',
      status: dto.status,
      notes: dto.notes ?? null,
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}
