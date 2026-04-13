import {
  IsString,
  IsArray,
  IsOptional,
  IsObject,
  IsEmail,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class OutreachTargetDto {
  @ApiProperty()
  @IsString()
  @MaxLength(200)
  name!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(200)
  company!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(200)
  role!: string;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  personalization?: Record<string, string>;
}

export class CreateCampaignDto {
  @ApiProperty()
  @IsString()
  @MaxLength(100)
  userId!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(300)
  name!: string;

  @ApiProperty({ type: [OutreachTargetDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OutreachTargetDto)
  targets!: OutreachTargetDto[];

  @ApiProperty({ description: 'Email template with {{placeholder}} support' })
  @IsString()
  @MaxLength(10000)
  template!: string;
}

export class GetOutreachHistoryQueryDto {
  @ApiProperty()
  @IsString()
  @MaxLength(100)
  userId!: string;
}
