import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { NarrativesController } from './narratives.controller';
import { NarrativesService } from './narratives.service';

@Module({
  imports: [AiModule],
  controllers: [NarrativesController],
  providers: [NarrativesService],
})
export class NarrativesModule {}
