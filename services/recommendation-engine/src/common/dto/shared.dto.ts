import {
  IsString,
  IsArray,
  IsInt,
  IsEnum,
  IsNumber,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class WorkExperienceDto {
  @ApiProperty({ example: 'Software Engineer' })
  @IsString()
  @MaxLength(200)
  title!: string;

  @ApiProperty({ example: 'Google' })
  @IsString()
  @MaxLength(200)
  company!: string;

  @ApiProperty({ example: '2020-2024' })
  @IsString()
  @MaxLength(100)
  duration!: string;

  @ApiProperty({ example: 'Built distributed systems serving 100M+ users' })
  @IsString()
  @MaxLength(2000)
  description!: string;
}

export class EducationDto {
  @ApiProperty({ example: 'B.S.' })
  @IsString()
  @MaxLength(100)
  degree!: string;

  @ApiProperty({ example: 'MIT' })
  @IsString()
  @MaxLength(200)
  institution!: string;

  @ApiProperty({ example: 'Computer Science' })
  @IsString()
  @MaxLength(200)
  field!: string;

  @ApiProperty({ example: 2020 })
  @IsInt()
  @Min(1950)
  year!: number;
}

export class UserProfileDto {
  @ApiProperty({ example: 'Alex Johnson' })
  @IsString()
  @MaxLength(200)
  name!: string;

  @ApiProperty({ example: 'Senior Software Engineer | Cloud Architecture | TypeScript' })
  @IsString()
  @MaxLength(500)
  headline!: string;

  @ApiProperty({ example: 'Technology' })
  @IsString()
  @MaxLength(200)
  industry!: string;

  @ApiProperty({ example: 'Senior Software Engineer' })
  @IsString()
  @MaxLength(200)
  currentRole!: string;

  @ApiProperty({ type: [WorkExperienceDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkExperienceDto)
  experience!: WorkExperienceDto[];

  @ApiProperty({ example: ['TypeScript', 'AWS', 'React', 'Node.js', 'System Design'] })
  @IsArray()
  @IsString({ each: true })
  skills!: string[];

  @ApiProperty({ type: [EducationDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EducationDto)
  education!: EducationDto[];

  @ApiProperty({ example: ['distributed systems', 'open source', 'mentoring'] })
  @IsArray()
  @IsString({ each: true })
  interests!: string[];

  @ApiProperty({ example: 'San Francisco, CA' })
  @IsString()
  @MaxLength(200)
  location!: string;
}

enum RemotePreferenceEnum {
  REMOTE = 'remote',
  HYBRID = 'hybrid',
  ONSITE = 'onsite',
  FLEXIBLE = 'flexible',
}

export class CareerGoalsDto {
  @ApiProperty({ example: 'Staff Engineer' })
  @IsString()
  @MaxLength(200)
  targetRole!: string;

  @ApiProperty({ example: 'Technology' })
  @IsString()
  @MaxLength(200)
  targetIndustry!: string;

  @ApiProperty({ example: '12 months' })
  @IsString()
  @MaxLength(100)
  timeframe!: string;

  @ApiProperty({ example: ['technical leadership', 'system design', 'mentoring'] })
  @IsArray()
  @IsString({ each: true })
  priorities!: string[];

  @ApiProperty({ example: '$200,000+' })
  @IsString()
  @MaxLength(100)
  salaryExpectation!: string;

  @ApiProperty({ example: 'large' })
  @IsString()
  @MaxLength(100)
  preferredCompanySize!: string;

  @ApiProperty({ enum: RemotePreferenceEnum, example: 'hybrid' })
  @IsEnum(RemotePreferenceEnum)
  remotePreference!: RemotePreferenceEnum;
}

export class MarketTrendsDto {
  @ApiProperty({ example: ['AI/ML', 'Rust', 'Platform Engineering'] })
  @IsArray()
  @IsString({ each: true })
  topSkills!: string[];

  @ApiProperty({ example: ['AI Engineer', 'Platform Engineer'] })
  @IsArray()
  @IsString({ each: true })
  emergingRoles!: string[];

  @ApiProperty({ example: 'Strong growth in AI/ML and cloud infrastructure' })
  @IsString()
  @MaxLength(500)
  industryGrowth!: string;

  @ApiProperty({ example: 'High demand expected through 2026' })
  @IsString()
  @MaxLength(500)
  demandForecast!: string;
}

export class NetworkAnalysisDto {
  @ApiProperty({ example: 2500 })
  @IsNumber()
  @Min(0)
  totalConnections!: number;

  @ApiProperty({ example: { Technology: 1200, Finance: 400, Healthcare: 200 } })
  industryBreakdown!: Record<string, number>;

  @ApiProperty({ example: { Senior: 800, Mid: 1000, Executive: 200 } })
  seniorityBreakdown!: Record<string, number>;

  @ApiProperty({ example: 'Active — 15 posts in last 30 days' })
  @IsString()
  @MaxLength(500)
  recentActivity!: string;

  @ApiProperty({ example: 150 })
  @IsNumber()
  @Min(0)
  strongTies!: number;

  @ApiProperty({ example: 2350 })
  @IsNumber()
  @Min(0)
  weakTies!: number;
}
