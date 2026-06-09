import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';

@Module({
  imports: [AiModule],
  controllers: [MatchesController],
  providers: [MatchesService],
})
export class MatchesModule {}
