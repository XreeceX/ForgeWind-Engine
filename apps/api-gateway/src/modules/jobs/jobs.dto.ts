import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsInt,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

export enum JobType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  INTERNSHIP = 'internship',
  FREELANCE = 'freelance',
}

export enum JobExperienceLevel {
  ENTRY = 'entry',
  MID = 'mid',
  SENIOR = 'senior',
  LEAD = 'lead',
  EXECUTIVE = 'executive',
}

export enum ApplicationStatus {
  SAVED = 'saved',
  APPLIED = 'applied',
  SCREENING = 'screening',
  INTERVIEWING = 'interviewing',
  OFFER = 'offer',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
}

export class SearchJobsDto {
  @ApiPropertyOptional({ example: 'frontend engineer' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  query?: string;

  @ApiPropertyOptional({ example: 'San Francisco, CA' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  location?: string;

  @ApiPropertyOptional({ enum: JobType })
  @IsEnum(JobType)
  @IsOptional()
  jobType?: JobType;

  @ApiPropertyOptional({ enum: JobExperienceLevel })
  @IsEnum(JobExperienceLevel)
  @IsOptional()
  experienceLevel?: JobExperienceLevel;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  remote?: boolean;

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

export class TrackApplicationDto {
  @ApiPropertyOptional({ example: 'Applied via company website' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;
}

export class UpdateApplicationDto {
  @ApiProperty({ enum: ApplicationStatus })
  @IsEnum(ApplicationStatus)
  status!: ApplicationStatus;

  @ApiPropertyOptional({ example: 'Phone screen scheduled for Friday' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;
}

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  jobType: JobType;
  experienceLevel: JobExperienceLevel;
  salary: { min: number; max: number; currency: string } | null;
  description: string;
  requirements: string[];
  postedAt: string;
  url: string;
}

export interface JobMatch {
  job: JobListing;
  matchScore: number;
  matchReasons: string[];
  missingSkills: string[];
}

export interface ApplicationRecord {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  status: ApplicationStatus;
  notes: string | null;
  appliedAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
