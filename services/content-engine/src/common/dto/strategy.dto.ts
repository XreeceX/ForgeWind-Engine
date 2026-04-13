import {
  IsString,
  IsArray,
  IsInt,
  IsNumber,
  IsEnum,
  Min,
  Max,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

enum ContentTypeEnum {
  TEXT = 'text',
  IMAGE = 'image',
  CAROUSEL = 'carousel',
  ARTICLE = 'article',
  POLL = 'poll',
}

export class GenerateCalendarDto {
  @ApiProperty({ example: 'Technology' })
  @IsString()
  @MaxLength(200)
  industry!: string;

  @ApiProperty({ example: 'Senior Software Engineer' })
  @IsString()
  @MaxLength(200)
  role!: string;

  @ApiProperty({ example: ['TypeScript', 'System Design', 'Leadership'] })
  @IsArray()
  @IsString({ each: true })
  expertise!: string[];

  @ApiProperty({ example: ['Build thought leadership', 'Grow network by 500 connections'] })
  @IsArray()
  @IsString({ each: true })
  goals!: string[];

  @ApiProperty({ example: 4, minimum: 1, maximum: 12 })
  @IsInt()
  @Min(1)
  @Max(12)
  weeksCount!: number;

  @ApiProperty({ example: 3, minimum: 1, maximum: 7 })
  @IsInt()
  @Min(1)
  @Max(7)
  postsPerWeek!: number;
}

class PostPerformanceDto {
  @ApiProperty({ example: 'Just shipped our new microservices architecture...' })
  @IsString()
  @MaxLength(5000)
  content!: string;

  @ApiProperty({ enum: ContentTypeEnum, example: 'text' })
  @IsEnum(ContentTypeEnum)
  contentType!: ContentTypeEnum;

  @ApiProperty({ example: 142 })
  @IsNumber()
  @Min(0)
  likes!: number;

  @ApiProperty({ example: 23 })
  @IsNumber()
  @Min(0)
  comments!: number;

  @ApiProperty({ example: 8 })
  @IsNumber()
  @Min(0)
  shares!: number;

  @ApiProperty({ example: 5400 })
  @IsNumber()
  @Min(0)
  impressions!: number;

  @ApiProperty({ example: '2024-11-01T10:00:00Z' })
  @IsString()
  postedAt!: string;

  @ApiProperty({ example: 'Microservices architecture' })
  @IsString()
  @MaxLength(500)
  topic!: string;
}

export class AnalyzePerformanceDto {
  @ApiProperty({ type: [PostPerformanceDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PostPerformanceDto)
  posts!: PostPerformanceDto[];
}

export class SuggestTopicsDto {
  @ApiProperty({ example: 'Technology' })
  @IsString()
  @MaxLength(200)
  industry!: string;

  @ApiProperty({ example: ['TypeScript', 'Cloud Architecture', 'Team Leadership'] })
  @IsArray()
  @IsString({ each: true })
  expertise!: string[];

  @ApiProperty({ example: ['Microservices', 'Remote work culture'] })
  @IsArray()
  @IsString({ each: true })
  recentTopics!: string[];

  @ApiProperty({ example: 'Engineering managers and senior developers' })
  @IsString()
  @MaxLength(500)
  targetAudience!: string;
}
