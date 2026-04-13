import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsInt,
  IsArray,
  IsNumber,
  Min,
  Max,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { JobType, ExperienceLevel } from '../interfaces';

class SalaryRangeDto {
  @IsNumber()
  @Min(0)
  min!: number;

  @IsNumber()
  @Min(0)
  max!: number;

  @IsString()
  @MaxLength(3)
  currency!: string;
}

export class SearchJobsDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  query?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  location?: string;

  @IsEnum(JobType)
  @IsOptional()
  jobType?: JobType;

  @IsEnum(ExperienceLevel)
  @IsOptional()
  experienceLevel?: ExperienceLevel;

  @IsBoolean()
  @IsOptional()
  remote?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  salaryMin?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  salaryMax?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  page: number = 1;

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit: number = 20;
}

export class CreateJobDto {
  @IsString()
  @MaxLength(300)
  title!: string;

  @IsString()
  @MaxLength(200)
  company!: string;

  @IsString()
  @MaxLength(200)
  location!: string;

  @IsBoolean()
  remote!: boolean;

  @IsString()
  @MaxLength(10000)
  description!: string;

  @IsArray()
  @IsString({ each: true })
  requirements!: string[];

  @IsArray()
  @IsString({ each: true })
  skills!: string[];

  @ValidateNested()
  @Type(() => SalaryRangeDto)
  @IsOptional()
  salaryRange?: SalaryRangeDto;

  @IsEnum(JobType)
  jobType!: JobType;

  @IsEnum(ExperienceLevel)
  experienceLevel!: ExperienceLevel;

  @IsString()
  @MaxLength(200)
  source!: string;

  @IsString()
  @MaxLength(2000)
  sourceUrl!: string;
}
