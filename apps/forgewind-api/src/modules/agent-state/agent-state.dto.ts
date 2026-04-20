import { Allow, IsEnum, IsOptional, IsString, IsUUID, ValidateIf } from 'class-validator';

export const agentModes = ['focus', 'explore', 'rest'] as const;
export const agentStatuses = ['idle', 'syncing', 'generating', 'error'] as const;

export class PatchAgentStateDto {
  @IsOptional()
  @IsEnum(agentModes as unknown as Record<string, string>)
  mode?: (typeof agentModes)[number];

  @IsOptional()
  @Allow()
  @ValidateIf((_, v) => v !== null && v !== undefined)
  @IsUUID()
  activeRepoId?: string | null;

  @IsOptional()
  @IsEnum(agentStatuses as unknown as Record<string, string>)
  agentStatus?: (typeof agentStatuses)[number];

  @IsOptional()
  @Allow()
  @ValidateIf((_, v) => v != null)
  @IsString()
  lastAction?: string | null;
}
