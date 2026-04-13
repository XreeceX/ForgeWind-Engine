import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUrl,
  IsObject,
  MaxLength,
} from 'class-validator';

export class AnalyzeProfileDto {
  @ApiPropertyOptional({
    example: 'https://linkedin.com/in/janedoe',
    description: 'LinkedIn profile URL to analyze',
  })
  @IsUrl()
  @IsOptional()
  linkedinUrl?: string;

  @ApiPropertyOptional({
    description: 'Raw profile data if not providing a URL',
    example: { headline: 'Software Engineer', summary: 'Building cool things...' },
  })
  @IsObject()
  @IsOptional()
  rawData?: Record<string, unknown>;
}

export class OptimizeProfileDto {
  @ApiPropertyOptional({
    example: 'Senior Frontend Engineer',
    description: 'Target role for optimization',
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  targetRole?: string;

  @ApiPropertyOptional({
    example: 'fintech',
    description: 'Target industry for tone/keyword optimization',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  targetIndustry?: string;
}

export class ImportProfileDto {
  @ApiProperty({
    description: 'LinkedIn data export (JSON parsed from their ZIP export)',
    example: {
      profile: { firstName: 'Jane', lastName: 'Doe' },
      positions: [],
      education: [],
      skills: [],
    },
  })
  @IsObject()
  data!: Record<string, unknown>;
}

export interface ProfileAnalysis {
  overallScore: number;
  sections: ProfileSectionScore[];
  keywords: string[];
  missingKeywords: string[];
  recommendations: string[];
}

export interface ProfileSectionScore {
  section: string;
  score: number;
  feedback: string;
}

export interface OptimizationSuggestion {
  section: string;
  current: string | null;
  suggested: string;
  reasoning: string;
  impact: 'high' | 'medium' | 'low';
}

export interface ImportResult {
  imported: boolean;
  sectionsProcessed: string[];
  warnings: string[];
}
