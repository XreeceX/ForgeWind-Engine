import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedForgeWindUser } from '../auth/jwt.strategy';
import { PatchAgentStateDto } from './agent-state.dto';
import { AgentStateService } from './agent-state.service';

@Controller('agent-state')
@UseGuards(JwtAuthGuard)
export class AgentStateController {
  constructor(private readonly agentState: AgentStateService) {}

  @Get()
  get(@CurrentUser() user: AuthenticatedForgeWindUser) {
    return this.agentState.getForUser(user.id);
  }

  @Patch()
  patch(@CurrentUser() user: AuthenticatedForgeWindUser, @Body() body: PatchAgentStateDto) {
    return this.agentState.patch(user.id, body);
  }
}
