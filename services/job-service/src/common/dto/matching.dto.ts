import {
  IsString,
  IsArray,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RemotePreference, CompanySize } from '../interfaces';

class CareerGoalsDto {
  @IsString()
  @IsOptional()
  targetRole?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  targetIndustry?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  targetCompanies?: string[];

  @IsOptional()
  salaryRange?: { min: number; max: number; currency: string };

  @IsBoolean()
  willingToRelocate!: boolean;

  @IsEnum(RemotePreference)
  remotePreference!: RemotePreference;
}

class UserPreferencesDto {
  @IsArray()
  @IsString({ each: true })
  preferredLocations!: string[];

  @IsEnum(RemotePreference)
  remotePreference!: RemotePreference;

  @IsArray()
  @IsEnum(CompanySize, { each: true })
  preferredCompanySize!: CompanySize[];

  @IsArray()
  @IsString({ each: true })
  preferredIndustries!: string[];

  @IsNumber()
  @IsOptional()
  @Min(0)
  minimumSalary?: number;

  @IsBoolean()
  willingToRelocate!: boolean;
}

export class ScoreMatchDto {
  @IsString()
  userId!: string;

  @IsString()
  jobId!: string;

  @IsArray()
  @IsString({ each: true })
  skills!: string[];

  @IsArray()
  @IsString({ each: true })
  experience!: string[];

  @IsArray()
  @IsString({ each: true })
  education!: string[];

  @ValidateNested()
  @Type(() => CareerGoalsDto)
  careerGoals!: CareerGoalsDto;

  @ValidateNested()
  @Type(() => UserPreferencesDto)
  preferences!: UserPreferencesDto;
}

export class GetMatchesDto {
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(50)
  limit?: number;
}
