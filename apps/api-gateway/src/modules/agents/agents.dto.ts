import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsObject,
  IsOptional,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export enum AgentType {
  PROFILE_OPTIMIZER = 'profile_optimizer',
  JOB_MATCHER = 'job_matcher',
  RESUME_TAILOR = 'resume_tailor',
  NETWORKING_COACH = 'networking_coach',
  INTERVIEW_PREP = 'interview_prep',
  SALARY_NEGOTIATOR = 'salary_negotiator',
}

export enum AgentTaskStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export class CreateAgentTaskDto {
  @ApiProperty({ enum: AgentType, example: AgentType.PROFILE_OPTIMIZER })
  @IsEnum(AgentType)
  agentType!: AgentType;

  @ApiProperty({
    description: 'Input data for the agent',
    example: { targetRole: 'Senior Frontend Engineer', focus: 'headline and summary' },
  })
  @IsObject()
  input!: Record<string, unknown>;
}

export class ListAgentTasksDto {
  @ApiPropertyOptional({ enum: AgentTaskStatus })
  @IsEnum(AgentTaskStatus)
  @IsOptional()
  status?: AgentTaskStatus;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;
}

export interface AgentTask {
  id: string;
  userId: string;
  agentType: AgentType;
  status: AgentTaskStatus;
  input: Record<string, unknown>;
  result: Record<string, unknown> | null;
  error: string | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
}

export interface AgentTaskPaginated {
  items: AgentTask[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
