import { Module } from '@nestjs/common';
import { GenerationController } from './generation.controller';
import { GenerationService } from './services/generation.service';
import { OpenAIService } from './services/openai.service';

@Module({
  controllers: [GenerationController],
  providers: [GenerationService, OpenAIService],
  exports: [GenerationService, OpenAIService],
})
export class GenerationModule {}
