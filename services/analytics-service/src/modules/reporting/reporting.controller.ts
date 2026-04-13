import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ReportGeneratorService } from './services/report-generator.service';

@ApiTags('Reporting')
@Controller('reports')
export class ReportingController {
  constructor(
    private readonly reportGenerator: ReportGeneratorService,
  ) {}

  @Get('weekly/:userId')
  @ApiOperation({ summary: 'Generate a weekly career activity report' })
  @ApiParam({ name: 'userId', description: 'Target user ID' })
  @ApiResponse({ status: 200, description: 'Weekly report generated' })
  async getWeeklyReport(@Param('userId') userId: string) {
    const report = await this.reportGenerator.generateWeeklyReport(userId);
    return { report };
  }

  @Get('progress/:userId')
  @ApiOperation({ summary: 'Generate a long-term career progress report' })
  @ApiParam({ name: 'userId', description: 'Target user ID' })
  @ApiResponse({ status: 200, description: 'Career progress report generated' })
  async getCareerProgressReport(@Param('userId') userId: string) {
    const report =
      await this.reportGenerator.generateCareerProgressReport(userId);
    return { report };
  }
}
