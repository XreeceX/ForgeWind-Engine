import { BadRequestException, Body, Controller, Get, Param, Post } from '@nestjs/common';
import { WorkflowService } from './workflow.service';

@Controller('workflow')
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Post('start')
  startSession(
    @Body() body: { userId?: string; repoId?: string },
  ): { sessionId: string; prompt: string } {
    if (!body.userId || !body.repoId) {
      throw new BadRequestException('userId and repoId are required');
    }

    const session = this.workflowService.startSession(body.userId, body.repoId);
    return {
      sessionId: session.id,
      prompt: this.workflowService.getPromptForStep(session.step),
    };
  }

  @Post('respond')
  respond(
    @Body() body: { sessionId?: string; response?: string },
  ): { sessionId: string; step: string; prompt: string; answers: unknown } {
    if (!body.sessionId || !body.response) {
      throw new BadRequestException('sessionId and response are required');
    }

    const session = this.workflowService.respond(body.sessionId, body.response);
    return {
      sessionId: session.id,
      step: session.step,
      prompt: this.workflowService.getPromptForStep(session.step),
      answers: session.answers,
    };
  }

  @Get(':sessionId')
  getSession(
    @Param('sessionId') sessionId: string,
  ): { sessionId: string; step: string; prompt: string; answers: unknown } {
    const session = this.workflowService.getSession(sessionId);
    return {
      sessionId: session.id,
      step: session.step,
      prompt: this.workflowService.getPromptForStep(session.step),
      answers: session.answers,
    };
  }
}
