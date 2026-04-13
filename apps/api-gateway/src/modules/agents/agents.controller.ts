import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiUnauthorizedResponse,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  CurrentUser,
  AuthenticatedUser,
} from '../../common/decorators/current-user.decorator';
import {
  CreateAgentTaskDto,
  ListAgentTasksDto,
  AgentTask,
  AgentTaskPaginated,
  AgentTaskStatus,
} from './agents.dto';

@ApiTags('Agents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('agents')
export class AgentsController {
  @Post('tasks')
  @ApiOperation({ summary: 'Create a new agent task' })
  @ApiCreatedResponse({ description: 'Task created and queued' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  createTask(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateAgentTaskDto,
  ): AgentTask {
    // TODO: Forward to agent-service POST /tasks
    return {
      id: 'task_001',
      userId: user.sub,
      agentType: dto.agentType,
      status: AgentTaskStatus.PENDING,
      input: dto.input,
      result: null,
      error: null,
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
    };
  }

  @Get('tasks')
  @ApiOperation({ summary: "List user's agent tasks" })
  @ApiOkResponse({ description: 'Paginated task list' })
  listTasks(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListAgentTasksDto,
  ): AgentTaskPaginated {
    // TODO: Forward to agent-service GET /tasks?userId=...
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const stubTask: AgentTask = {
      id: 'task_001',
      userId: user.sub,
      agentType: 'profile_optimizer' as AgentTask['agentType'],
      status: AgentTaskStatus.COMPLETED,
      input: { targetRole: 'Senior Frontend Engineer' },
      result: {
        suggestions: [
          'Update headline to include target keywords',
          'Add quantified achievements to experience',
        ],
      },
      error: null,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      startedAt: new Date(Date.now() - 3500000).toISOString(),
      completedAt: new Date(Date.now() - 3400000).toISOString(),
    };

    const items = query.status
      ? [stubTask].filter((t) => t.status === query.status)
      : [stubTask];

    return {
      items,
      total: items.length,
      page,
      limit,
      totalPages: 1,
    };
  }

  @Get('tasks/:id')
  @ApiOperation({ summary: 'Get agent task status and result' })
  @ApiOkResponse({ description: 'Task details' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  getTask(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): AgentTask {
    // TODO: Forward to agent-service GET /tasks/:id
    return {
      id,
      userId: user.sub,
      agentType: 'profile_optimizer' as AgentTask['agentType'],
      status: AgentTaskStatus.COMPLETED,
      input: { targetRole: 'Senior Frontend Engineer' },
      result: {
        suggestions: [
          'Update headline to include target keywords',
          'Add quantified achievements to experience',
        ],
        optimizedSections: {
          headline: 'Senior Frontend Engineer | React & TypeScript | Building AI-Powered Products',
        },
      },
      error: null,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      startedAt: new Date(Date.now() - 3500000).toISOString(),
      completedAt: new Date(Date.now() - 3400000).toISOString(),
    };
  }

  @Delete('tasks/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancel a running agent task' })
  @ApiNoContentResponse({ description: 'Task cancelled' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  cancelTask(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): void {
    // TODO: Forward to agent-service DELETE /tasks/:id
    void user;
    void id;
  }
}
