import { Module } from '@nestjs/common';
import { AgentStateController } from './agent-state.controller';
import { AgentStateService } from './agent-state.service';

@Module({
  controllers: [AgentStateController],
  providers: [AgentStateService],
})
export class AgentStateModule {}
