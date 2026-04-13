import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Sse,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { MessageEvent } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  AuthenticatedUser,
  CurrentUser,
} from '../../common/decorators/current-user.decorator';
import {
  CreateAiSessionDto,
  CreateAiSessionResponse,
} from './ai-session.dto';
import { AiSessionService } from './ai-session.service';
import { SessionSummary } from './ai-session.types';

@ApiTags('AI Sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai/sessions')
export class AiSessionController {
  constructor(private readonly aiSessionService: AiSessionService) {}

  @Post()
  @ApiOperation({ summary: 'Create an AI orchestration session' })
  @ApiCreatedResponse({ description: 'Session created successfully' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  createSession(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateAiSessionDto,
  ): CreateAiSessionResponse {
    const session = this.aiSessionService.createSession(user.sub, dto);
    return { sessionId: session.sessionId };
  }

  @Get(':sessionId')
  @ApiOperation({ summary: 'Get AI session metadata' })
  @ApiOkResponse({ description: 'Session metadata returned' })
  getSession(
    @CurrentUser() user: AuthenticatedUser,
    @Param('sessionId') sessionId: string,
  ): SessionSummary {
    return this.aiSessionService.getSession(sessionId, user.sub);
  }

  @Sse(':sessionId/stream')
  @ApiOperation({ summary: 'Open AI orchestration event stream (SSE)' })
  @ApiOkResponse({ description: 'SSE stream of orchestration events' })
  streamSession(
    @CurrentUser() user: AuthenticatedUser,
    @Param('sessionId') sessionId: string,
  ): Observable<MessageEvent> {
    return this.aiSessionService.streamSession(sessionId, user.sub);
  }
}
