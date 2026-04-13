import {
  IsString,
  IsOptional,
  IsInt,
  IsObject,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitFeedbackDto {
  @ApiProperty({ description: 'User submitting the feedback' })
  @IsString()
  @MaxLength(100)
  userId!: string;

  @ApiProperty({ description: 'Feature being rated' })
  @IsString()
  @MaxLength(200)
  featureId!: string;

  @ApiProperty({ description: 'Rating from 1 to 5', minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiPropertyOptional({ description: 'Optional text comment' })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  comment?: string;

  @ApiPropertyOptional({ description: 'Contextual data for the feedback' })
  @IsObject()
  @IsOptional()
  context?: Record<string, unknown>;
}
