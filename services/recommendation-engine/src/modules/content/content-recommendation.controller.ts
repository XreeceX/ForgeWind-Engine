import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ContentRecommenderService } from './services/content-recommender.service';
import {
  RecommendTopicsDto,
  RecommendPeopleDto,
  RecommendCompaniesDto,
} from '../../common/dto';
import {
  TopicRecommendation,
  PersonRecommendation,
  CompanyRecommendation,
} from '../../common/interfaces';

@ApiTags('Content Recommendations')
@Controller('recommendations')
export class ContentRecommendationController {
  constructor(private readonly recommenderService: ContentRecommenderService) {}

  @Post('topics')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get topic recommendations based on profile' })
  @ApiResponse({ status: 200, description: 'Topic recommendations with engagement predictions' })
  async recommendTopics(@Body() dto: RecommendTopicsDto): Promise<TopicRecommendation[]> {
    return this.recommenderService.recommendTopics(dto.profile);
  }

  @Post('people')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get recommendations for people to follow' })
  @ApiResponse({ status: 200, description: 'People recommendations with engagement tips' })
  async recommendPeople(@Body() dto: RecommendPeopleDto): Promise<PersonRecommendation[]> {
    return this.recommenderService.recommendPeopleToFollow(dto.profile);
  }

  @Post('companies')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get company targeting recommendations' })
  @ApiResponse({ status: 200, description: 'Company recommendations with connection strategies' })
  async recommendCompanies(@Body() dto: RecommendCompaniesDto): Promise<CompanyRecommendation[]> {
    return this.recommenderService.recommendCompaniesToTarget(dto.profile, dto.careerGoals);
  }
}
