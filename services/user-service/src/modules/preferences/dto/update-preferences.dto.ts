import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePreferencesDto {
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  jobAlerts?: boolean;

  @IsOptional()
  @IsBoolean()
  weeklyDigest?: boolean;

  @IsOptional()
  @IsBoolean()
  contentSuggestions?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  preferredContentTone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  timezone?: string;
}
