import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ApplicationAssistantService } from './services/application-assistant.service';
import { PrepareApplicationDto, TrackApplicationDto } from '../../common/dto';

@ApiTags('Applications')
@Controller('applications')
export class ApplicationsController {
  constructor(
    private readonly applicationAssistant: ApplicationAssistantService,
  ) {}

  @Post('prepare')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Prepare a tailored job application' })
  @ApiResponse({ status: 200, description: 'Application prepared' })
  async prepareApplication(@Body() dto: PrepareApplicationDto) {
    const prepared = await this.applicationAssistant.prepareApplication({
      userId: dto.userId,
      jobTitle: dto.jobTitle,
      company: dto.company,
      jobDescription: dto.jobDescription,
      jobRequirements: dto.jobRequirements,
      userSkills: dto.userSkills,
      userExperience: dto.userExperience,
      userSummary: dto.userSummary,
    });
    return { success: true, application: prepared };
  }

  @Post('track')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Track a job application' })
  @ApiResponse({ status: 201, description: 'Application tracked' })
  async trackApplication(@Body() dto: TrackApplicationDto) {
    const tracked = await this.applicationAssistant.trackApplication({
      userId: dto.userId,
      jobTitle: dto.jobTitle,
      company: dto.company,
      status: dto.status,
      notes: dto.notes,
    });
    return { success: true, application: tracked };
  }

  @Get('insights/:userId')
  @ApiOperation({ summary: 'Get application insights for a user' })
  @ApiParam({ name: 'userId', description: 'Target user ID' })
  @ApiResponse({ status: 200, description: 'Application insights generated' })
  async getInsights(@Param('userId') userId: string) {
    const insights =
      await this.applicationAssistant.getApplicationInsights(userId);
    return { insights };
  }
}
