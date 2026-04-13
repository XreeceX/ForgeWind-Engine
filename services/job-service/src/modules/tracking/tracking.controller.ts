import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TrackingService } from './tracking.service';
import {
  CreateApplicationDto,
  UpdateApplicationStatusDto,
  ApplicationFiltersDto,
} from '../../common/dto';
import { Application, ApplicationStats } from '../../common/interfaces';

@Controller('tracking')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Post('applications')
  @HttpCode(HttpStatus.CREATED)
  async createApplication(
    @Query('userId') userId: string,
    @Body() dto: CreateApplicationDto,
  ): Promise<Application> {
    return this.trackingService.createApplication(userId, dto);
  }

  @Patch('applications/:id')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStatusDto,
  ): Promise<Application> {
    return this.trackingService.updateStatus(id, dto.status, dto.notes);
  }

  @Get('applications')
  async getApplications(
    @Query('userId') userId: string,
    @Query() filters: ApplicationFiltersDto,
  ): Promise<Application[]> {
    return this.trackingService.getApplications(userId, {
      status: filters.status,
      company: filters.company,
      dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
      dateTo: filters.dateTo ? new Date(filters.dateTo) : undefined,
    });
  }

  @Get('stats')
  async getStats(
    @Query('userId') userId: string,
  ): Promise<ApplicationStats> {
    return this.trackingService.getApplicationStats(userId);
  }
}
