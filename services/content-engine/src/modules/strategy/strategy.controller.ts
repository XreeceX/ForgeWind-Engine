import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StrategyService } from './services/strategy.service';
import {
  GenerateCalendarDto,
  AnalyzePerformanceDto,
  SuggestTopicsDto,
} from '../../common/dto';
import {
  ContentCalendar,
  ContentInsights,
  TopicSuggestions,
} from '../../common/interfaces';

@ApiTags('Strategy')
@Controller('strategy')
export class StrategyController {
  constructor(private readonly strategyService: StrategyService) {}

  @Post('calendar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate a weekly content calendar' })
  @ApiResponse({ status: 200, description: 'Content calendar with weekly post plans' })
  async generateCalendar(@Body() dto: GenerateCalendarDto): Promise<ContentCalendar> {
    return this.strategyService.generateContentCalendar({
      industry: dto.industry,
      role: dto.role,
      expertise: dto.expertise,
      goals: dto.goals,
      weeksCount: dto.weeksCount,
      postsPerWeek: dto.postsPerWeek,
    });
  }

  @Post('analyze')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Analyze content performance metrics' })
  @ApiResponse({ status: 200, description: 'Performance insights and recommendations' })
  async analyzePerformance(@Body() dto: AnalyzePerformanceDto): Promise<ContentInsights> {
    return this.strategyService.analyzeContentPerformance(dto.posts);
  }

  @Post('topics')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get AI-suggested content topics' })
  @ApiResponse({ status: 200, description: 'Topic suggestions with reasoning and trending topics' })
  async suggestTopics(@Body() dto: SuggestTopicsDto): Promise<TopicSuggestions> {
    return this.strategyService.suggestTopics({
      industry: dto.industry,
      expertise: dto.expertise,
      recentTopics: dto.recentTopics,
      targetAudience: dto.targetAudience,
    });
  }
}
