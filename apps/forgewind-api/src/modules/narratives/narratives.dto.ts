import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export const narrativeTypes = [
  'bio',
  'project_summary',
  'commit_story',
] as const;

export type NarrativeType = (typeof narrativeTypes)[number];

export class GenerateNarrativeDto {
  @IsUUID()
  userId!: string;

  @IsOptional()
  @IsUUID()
  repoId?: string;

  @IsEnum(narrativeTypes as unknown as Record<string, string>)
  type!: NarrativeType;
}

export class PinNarrativeDto {
  @IsOptional()
  isPinned?: boolean;
}

export class ListNarrativesQueryDto {
  @IsOptional()
  @IsEnum(narrativeTypes as unknown as Record<string, string>)
  type?: NarrativeType;
}
