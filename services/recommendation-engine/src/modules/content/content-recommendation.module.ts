import { Module } from '@nestjs/common';
import { ContentRecommendationController } from './content-recommendation.controller';
import { ContentRecommenderService } from './services/content-recommender.service';
import { OpenAIService } from '../../common/services/openai.service';

@Module({
  controllers: [ContentRecommendationController],
  providers: [ContentRecommenderService, OpenAIService],
  exports: [ContentRecommenderService],
})
export class ContentRecommendationModule {}
