import {
  IsString,
  IsArray,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsDateString,
  IsObject,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReminderType, ScheduleFrequency } from '../interfaces';

const REMINDER_TYPES: ReminderType[] = [
  'follow_up',
  'application_deadline',
  'interview',
  'networking',
  'content_post',
  'custom',
];

const SCHEDULE_FREQUENCIES: ScheduleFrequency[] = [
  'daily',
  'weekly',
  'biweekly',
  'monthly',
];

export class CreateReminderDto {
  @ApiProperty()
  @IsString()
  @MaxLength(100)
  userId!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(300)
  title!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(2000)
  description!: string;

  @ApiProperty({ description: 'ISO date string' })
  @IsDateString()
  dueDate!: string;

  @ApiProperty({ enum: REMINDER_TYPES })
  @IsEnum(REMINDER_TYPES, {
    message: `type must be one of: ${REMINDER_TYPES.join(', ')}`,
  })
  type!: ReminderType;
}

export class UpdateReminderDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(300)
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}

class ScheduledActionDto {
  @ApiProperty()
  @IsString()
  @MaxLength(200)
  type!: string;

  @ApiProperty()
  @IsObject()
  params!: Record<string, unknown>;

  @ApiProperty({ description: 'Time in HH:mm format' })
  @IsString()
  @MaxLength(10)
  time!: string;
}

export class CreateScheduleDto {
  @ApiProperty()
  @IsString()
  @MaxLength(100)
  userId!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(300)
  name!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(2000)
  description!: string;

  @ApiProperty({ enum: SCHEDULE_FREQUENCIES })
  @IsEnum(SCHEDULE_FREQUENCIES, {
    message: `frequency must be one of: ${SCHEDULE_FREQUENCIES.join(', ')}`,
  })
  frequency!: ScheduleFrequency;

  @ApiProperty({ type: [ScheduledActionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduledActionDto)
  actions!: ScheduledActionDto[];
}

export class GetRemindersQueryDto {
  @ApiProperty()
  @IsString()
  @MaxLength(100)
  userId!: string;
}

export class GetSchedulesQueryDto {
  @ApiProperty()
  @IsString()
  @MaxLength(100)
  userId!: string;
}
