import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileSummaryDto {
  @IsOptional()
  @IsString()
  @MaxLength(220)
  headline?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2600)
  about?: string;
}
