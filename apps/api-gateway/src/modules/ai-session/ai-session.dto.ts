import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAiSessionDto {
  @ApiProperty({
    description: 'User intent for the orchestration run.',
    example: 'generate linkedin post',
  })
  @IsString()
  @MaxLength(120)
  intent!: string;

  @ApiPropertyOptional({
    description: 'Repository selected by the user for contextual analysis.',
    example: 'repo_123',
  })
  @IsOptional()
  @IsString()
  selectedRepoId?: string;

  @ApiPropertyOptional({
    description: 'Optional free-form prompt from the UI.',
    example: 'Focus on backend architecture wins from this week.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  prompt?: string;
}

export interface CreateAiSessionResponse {
  sessionId: string;
}
