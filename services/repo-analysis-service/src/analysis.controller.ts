import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { AnalyzeRepoBodyDto } from './dto/analyze-repo.dto';

@Controller()
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post('analyze-repo')
  async analyzeRepo(
    @Body() body: AnalyzeRepoBodyDto,
  ): Promise<{ userId: string; analyses: unknown[] }> {
    const repos = body.repos ?? [];
    if (repos.length === 0) {
      throw new BadRequestException(
        'Request must include a non-empty repos array. repositoryIds-only requests are not supported by this endpoint.',
      );
    }
    const analyses = await Promise.all(
      repos.map((repo) => this.analysisService.analyzeRepository(repo)),
    );

    return {
      userId: body.userId,
      analyses,
    };
  }
}
