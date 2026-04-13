import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SkillAnalyzerService } from './services/skill-analyzer.service';
import { SkillRecommenderService } from './services/skill-recommender.service';
import {
  AnalyzeSkillGapsDto,
  RecommendSkillsDto,
  RecommendCertificationsDto,
  RecommendProjectsDto,
} from '../../common/dto';
import {
  SkillGapAnalysis,
  SkillRecommendation,
  CertificationRecommendation,
  ProjectRecommendation,
} from '../../common/interfaces';

@ApiTags('Skills')
@Controller('skills')
export class SkillsController {
  constructor(
    private readonly analyzerService: SkillAnalyzerService,
    private readonly recommenderService: SkillRecommenderService,
  ) {}

  @Post('analyze')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Analyze skill gaps for a target role' })
  @ApiResponse({ status: 200, description: 'Skill gap analysis with learning path' })
  async analyzeGaps(@Body() dto: AnalyzeSkillGapsDto): Promise<SkillGapAnalysis> {
    return this.analyzerService.analyzeSkillGaps(dto.userSkills, dto.targetRole);
  }

  @Post('recommend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get AI-powered skill recommendations' })
  @ApiResponse({ status: 200, description: 'Skill recommendations with market context' })
  async recommendSkills(@Body() dto: RecommendSkillsDto): Promise<SkillRecommendation[]> {
    return this.recommenderService.recommendSkills(dto.profile, dto.marketData);
  }

  @Post('certifications')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get certification recommendations' })
  @ApiResponse({ status: 200, description: 'Certification recommendations for target role' })
  async recommendCertifications(
    @Body() dto: RecommendCertificationsDto,
  ): Promise<CertificationRecommendation[]> {
    return this.recommenderService.recommendCertifications(dto.profile, dto.targetRole);
  }

  @Post('projects')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get portfolio project recommendations' })
  @ApiResponse({ status: 200, description: 'Project ideas for portfolio building' })
  async recommendProjects(@Body() dto: RecommendProjectsDto): Promise<ProjectRecommendation[]> {
    return this.recommenderService.recommendProjects(dto.skills, dto.targetRole);
  }
}
