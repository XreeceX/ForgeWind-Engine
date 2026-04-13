import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import { MatchingService } from './services/matching.service';
import { ScoreMatchDto, GetMatchesDto } from '../../common/dto';
import { MatchedJob, MatchExplanation, RemotePreference, CompanySize } from '../../common/interfaces';

@Controller('matching')
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Get(':userId')
  async getMatches(
    @Param('userId') userId: string,
    @Query() query: GetMatchesDto,
  ): Promise<MatchedJob[]> {
    return this.matchingService.findMatchesForUser(userId, query.limit);
  }

  @Get(':userId/explain/:jobId')
  async explainMatch(
    @Param('userId') userId: string,
    @Param('jobId') jobId: string,
  ): Promise<MatchExplanation> {
    return this.matchingService.explainMatch(userId, jobId);
  }

  @Post('score')
  async scoreMatch(@Body() dto: ScoreMatchDto): Promise<MatchedJob> {
    return this.matchingService.scoreForPair(
      {
        id: dto.userId,
        skills: dto.skills,
        experience: dto.experience,
        education: dto.education,
        careerGoals: {
          targetRole: dto.careerGoals.targetRole ?? null,
          targetIndustry: dto.careerGoals.targetIndustry ?? null,
          targetCompanies: dto.careerGoals.targetCompanies ?? null,
          salaryRange: dto.careerGoals.salaryRange ?? null,
          willingToRelocate: dto.careerGoals.willingToRelocate,
          remotePreference: dto.careerGoals.remotePreference as RemotePreference,
        },
        preferences: {
          preferredLocations: dto.preferences.preferredLocations,
          remotePreference: dto.preferences.remotePreference as RemotePreference,
          preferredCompanySize: dto.preferences.preferredCompanySize as CompanySize[],
          preferredIndustries: dto.preferences.preferredIndustries,
          minimumSalary: dto.preferences.minimumSalary ?? null,
          willingToRelocate: dto.preferences.willingToRelocate,
        },
      },
      dto.jobId,
    );
  }
}
