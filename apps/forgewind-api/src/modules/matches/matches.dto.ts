import { IsEnum } from 'class-validator';

export const matchStatuses = ['saved', 'dismissed'] as const;
export type MatchStatusUpdate = (typeof matchStatuses)[number];

export class UpdateMatchStatusDto {
  @IsEnum(matchStatuses as unknown as Record<string, string>)
  status!: MatchStatusUpdate;
}
