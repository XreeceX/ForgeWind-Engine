import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { RemotePreference } from '@prisma/client';

export class UpdateCareerGoalsDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  targetRole?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetIndustries?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetCompanies?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  salaryMin?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  salaryMax?: number;

  @IsOptional()
  @IsString()
  salaryCurrency?: string;

  @IsOptional()
  @IsBoolean()
  willingToRelocate?: boolean;

  @IsOptional()
  @IsEnum(RemotePreference)
  remotePreference?: RemotePreference;
}
