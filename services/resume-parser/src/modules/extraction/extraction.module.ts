import { Module } from '@nestjs/common';
import { ExtractionController } from './extraction.controller';
import { ExtractionService } from './services/extraction.service';
import { OpenAIService } from './services/openai.service';
import { ParserModule } from '../parser/parser.module';

@Module({
  imports: [ParserModule],
  controllers: [ExtractionController],
  providers: [ExtractionService, OpenAIService],
  exports: [ExtractionService],
})
export class ExtractionModule {}
