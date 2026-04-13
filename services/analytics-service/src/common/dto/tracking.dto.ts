import {
  IsString,
  IsOptional,
  IsEnum,
  IsObject,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventCategory } from '../interfaces';

export class TrackEventDto {
  @ApiProperty({ description: 'User ID who triggered the event' })
  @IsString()
  @MaxLength(100)
  userId!: string;

  @ApiProperty({ enum: EventCategory, description: 'Category of the event' })
  @IsEnum(EventCategory)
  eventType!: EventCategory;

  @ApiProperty({ description: 'Specific action within the category' })
  @IsString()
  @MaxLength(200)
  action!: string;

  @ApiPropertyOptional({ description: 'Additional event data' })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}

export class GetEventsQueryDto {
  @ApiProperty({ description: 'User ID to retrieve events for' })
  @IsString()
  @MaxLength(100)
  userId!: string;

  @ApiPropertyOptional({ enum: EventCategory })
  @IsEnum(EventCategory)
  @IsOptional()
  eventType?: EventCategory;

  @ApiPropertyOptional({ description: 'ISO date string for range start' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: 'ISO date string for range end' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Filter by specific action' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  action?: string;
}
