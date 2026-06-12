import { Module } from '@nestjs/common';
import { AnthropicService } from './anthropic.service';
import { AiController } from './ai.controller';

@Module({
  controllers: [AiController],
  providers: [AnthropicService],
  exports: [AnthropicService],
})
export class AiModule {}
