import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsObject,
  IsOptional,
  MaxLength,
} from 'class-validator';

export enum ContentType {
  LINKEDIN_POST = 'linkedin_post',
  ABOUT_SECTION = 'about_section',
  HEADLINE = 'headline',
  EXPERIENCE = 'experience',
  COLD_EMAIL = 'cold_email',
}

export class GenerateContentDto {
  @ApiProperty({ enum: ContentType, example: ContentType.LINKEDIN_POST })
  @IsEnum(ContentType)
  type!: ContentType;

  @ApiProperty({
    description: 'Context for generation (topic, audience, etc.)',
    example: { topic: 'AI in recruiting', audience: 'hiring managers', goal: 'thought leadership' },
  })
  @IsObject()
  context!: Record<string, unknown>;

  @ApiPropertyOptional({
    example: 'professional',
    description: 'Tone: professional, casual, persuasive, storytelling, technical',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  tone?: string;
}

export class RewriteContentDto {
  @ApiProperty({
    example: 'I worked on many projects and learned a lot about coding.',
    description: 'Original text to rewrite',
  })
  @IsString()
  @MaxLength(5000)
  text!: string;

  @ApiPropertyOptional({
    example: 'Make it more impactful with quantified achievements',
    description: 'Specific instructions for the rewrite',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  instructions?: string;

  @ApiPropertyOptional({ example: 'professional' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  tone?: string;
}

export interface GeneratedContent {
  id: string;
  type: ContentType;
  content: string;
  alternatives: string[];
  metadata: {
    readabilityScore: number;
    estimatedEngagement: 'low' | 'medium' | 'high';
    wordCount: number;
    hashtags: string[];
  };
}

export interface ContentStrategy {
  weeklyPlan: DayPlan[];
  themes: string[];
  bestPostingTimes: string[];
  audienceInsights: string[];
}

export interface DayPlan {
  day: string;
  contentType: ContentType;
  topic: string;
  notes: string;
}

export interface ContentTemplate {
  id: string;
  name: string;
  type: ContentType;
  template: string;
  description: string;
  variables: string[];
}

export interface RewriteResult {
  original: string;
  rewritten: string;
  improvements: string[];
}
