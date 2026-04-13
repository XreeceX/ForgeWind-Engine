import {
  IsString,
  IsArray,
  IsOptional,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationStatusValue } from '../interfaces';

const APPLICATION_STATUSES: ApplicationStatusValue[] = [
  'saved',
  'applied',
  'screening',
  'interviewing',
  'offer',
  'rejected',
  'withdrawn',
];

export class PrepareApplicationDto {
  @ApiProperty()
  @IsString()
  @MaxLength(100)
  userId!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(300)
  jobTitle!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(200)
  company!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(10000)
  jobDescription!: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  jobRequirements!: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  userSkills!: string[];

  @ApiProperty()
  @IsString()
  @MaxLength(5000)
  userExperience!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(2000)
  userSummary!: string;
}

export class TrackApplicationDto {
  @ApiProperty()
  @IsString()
  @MaxLength(100)
  userId!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(300)
  jobTitle!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(200)
  company!: string;

  @ApiProperty({ enum: APPLICATION_STATUSES })
  @IsEnum(APPLICATION_STATUSES, {
    message: `status must be one of: ${APPLICATION_STATUSES.join(', ')}`,
  })
  status!: ApplicationStatusValue;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  notes?: string;
}
