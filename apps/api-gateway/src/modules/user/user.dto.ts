import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  MaxLength,
  IsEnum,
} from 'class-validator';

export enum ExperienceLevel {
  JUNIOR = 'junior',
  MID = 'mid',
  SENIOR = 'senior',
  LEAD = 'lead',
  EXECUTIVE = 'executive',
}

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Jane' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  lastName?: string;

  @ApiPropertyOptional({ example: 'Full-stack developer focused on AI products' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  headline?: string;

  @ApiPropertyOptional({ example: 'San Francisco, CA' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  location?: string;

  @ApiPropertyOptional({ example: 'https://linkedin.com/in/janedoe' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  linkedinUrl?: string;
}

export class UpdateCareerGoalsDto {
  @ApiPropertyOptional({ example: 'Senior Frontend Engineer' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  targetRole?: string;

  @ApiPropertyOptional({ example: ['fintech', 'ai', 'healthtech'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  targetIndustries?: string[];

  @ApiPropertyOptional({ example: 'senior', enum: ExperienceLevel })
  @IsEnum(ExperienceLevel)
  @IsOptional()
  targetLevel?: ExperienceLevel;

  @ApiPropertyOptional({ example: 150000 })
  @IsOptional()
  salaryMin?: number;

  @ApiPropertyOptional({ example: 220000 })
  @IsOptional()
  salaryMax?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  openToRemote?: boolean;

  @ApiPropertyOptional({ example: ['San Francisco', 'New York', 'Remote'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  preferredLocations?: string[];
}

export interface UserProfileResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  headline: string | null;
  location: string | null;
  linkedinUrl: string | null;
  roles: string[];
  careerGoals: CareerGoalsResponse | null;
  createdAt: string;
  updatedAt: string;
}

export interface CareerGoalsResponse {
  targetRole: string | null;
  targetIndustries: string[];
  targetLevel: ExperienceLevel | null;
  salaryMin: number | null;
  salaryMax: number | null;
  openToRemote: boolean;
  preferredLocations: string[];
}
