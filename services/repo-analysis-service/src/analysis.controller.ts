import { Body, Controller, Post } from '@nestjs/common';
import { AnalysisService } from './analysis.service';

interface AnalyzeRepoBody {
  userId: string;
  repositoryIds?: string[];
  repos?: Array<{
    id?: string;
    fullName?: string;
    name: string;
    description?: string | null;
    language?: string | null;
    metadata?: Record<string, unknown>;
  }>;
}

@Controller()
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post('analyze-repo')
  async analyzeRepo(
    @Body() body: AnalyzeRepoBody,
  ): Promise<{ userId: string; analyses: unknown[] }> {
    const repos = body.repos ?? [];
    const analyses = await Promise.all(
      repos.map((repo) => this.analysisService.analyzeRepository(repo)),
    );

    return {
      userId: body.userId,
      analyses,
    };
  }
}
