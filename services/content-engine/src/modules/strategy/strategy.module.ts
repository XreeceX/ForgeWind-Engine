import { Module } from '@nestjs/common';
import { GenerationModule } from '../generation/generation.module';
import { StrategyController } from './strategy.controller';
import { StrategyService } from './services/strategy.service';

@Module({
  imports: [GenerationModule],
  controllers: [StrategyController],
  providers: [StrategyService],
  exports: [StrategyService],
})
export class StrategyModule {}
