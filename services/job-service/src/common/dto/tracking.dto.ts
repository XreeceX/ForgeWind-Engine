import {
  IsString,
  IsOptional,
  IsEnum,
  MaxLength,
  IsDateString,
} from 'class-validator';
import { ApplicationStatus } from '../interfaces';

export class CreateApplicationDto {
  @IsString()
  jobId!: string;

  @IsString()
  @MaxLength(300)
  jobTitle!: string;

  @IsString()
  @MaxLength(200)
  company!: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  notes?: string;
}

export class UpdateApplicationStatusDto {
  @IsEnum(ApplicationStatus)
  status!: ApplicationStatus;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  notes?: string;
}

export class ApplicationFiltersDto {
  @IsEnum(ApplicationStatus)
  @IsOptional()
  status?: ApplicationStatus;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  company?: string;

  @IsDateString()
  @IsOptional()
  dateFrom?: string;

  @IsDateString()
  @IsOptional()
  dateTo?: string;
}
