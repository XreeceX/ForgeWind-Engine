import { Body, Controller, Post } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { AnalyzeActivityDto } from '../../common/dto';
import { ActivityAnalysis } from '../../common/interfaces';

@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Post('analyze')
  async analyzeActivity(@Body() dto: AnalyzeActivityDto): Promise<ActivityAnalysis> {
    return this.activityService.analyzePostingActivity(dto.posts);
  }
}
