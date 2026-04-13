import { Module } from '@nestjs/common';
import { MatchingController } from './matching.controller';
import { MatchingService } from './services/matching.service';
import { EmbeddingService } from './services/embedding.service';
import { ScoringService } from './services/scoring.service';
import { JobsModule } from '../jobs/jobs.module';

@Module({
  imports: [JobsModule],
  controllers: [MatchingController],
  providers: [MatchingService, EmbeddingService, ScoringService],
  exports: [MatchingService, EmbeddingService],
})
export class MatchingModule {}
