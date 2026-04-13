import { Module } from '@nestjs/common';
import { NetworkingController } from './networking.controller';
import { NetworkingRecommenderService } from './services/networking-recommender.service';
import { OpenAIService } from '../../common/services/openai.service';

@Module({
  controllers: [NetworkingController],
  providers: [NetworkingRecommenderService, OpenAIService],
  exports: [NetworkingRecommenderService],
})
export class NetworkingModule {}
