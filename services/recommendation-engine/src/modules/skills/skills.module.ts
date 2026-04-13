import { Module } from '@nestjs/common';
import { SkillsController } from './skills.controller';
import { SkillAnalyzerService } from './services/skill-analyzer.service';
import { SkillRecommenderService } from './services/skill-recommender.service';
import { OpenAIService } from '../../common/services/openai.service';

@Module({
  controllers: [SkillsController],
  providers: [SkillAnalyzerService, SkillRecommenderService, OpenAIService],
  exports: [SkillAnalyzerService, SkillRecommenderService],
})
export class SkillsModule {}
