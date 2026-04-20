import { Body, Controller, Get, Patch } from '@nestjs/common';
import { StubUserId } from '../../common/decorators/stub-user-id.decorator';
import { PatchAgentStateDto } from './agent-state.dto';
import { AgentStateService } from './agent-state.service';

@Controller('agent-state')
export class AgentStateController {
  constructor(private readonly agentState: AgentStateService) {}

  @Get()
  get(@StubUserId() userId: string) {
    return this.agentState.getForUser(userId);
  }

  @Patch()
  patch(@StubUserId() userId: string, @Body() body: PatchAgentStateDto) {
    return this.agentState.patch(userId, body);
  }
}
