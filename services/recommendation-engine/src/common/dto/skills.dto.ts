import { IsString, IsArray, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UserProfileDto, MarketTrendsDto } from './shared.dto';

export class AnalyzeSkillGapsDto {
  @ApiProperty({ example: ['TypeScript', 'React', 'Node.js', 'AWS', 'PostgreSQL'] })
  @IsArray()
  @IsString({ each: true })
  userSkills!: string[];

  @ApiProperty({ example: 'Staff Software Engineer' })
  @IsString()
  @MaxLength(200)
  targetRole!: string;
}

export class RecommendSkillsDto {
  @ApiProperty({ type: UserProfileDto })
  @ValidateNested()
  @Type(() => UserProfileDto)
  profile!: UserProfileDto;

  @ApiProperty({ type: MarketTrendsDto })
  @ValidateNested()
  @Type(() => MarketTrendsDto)
  marketData!: MarketTrendsDto;
}

export class RecommendCertificationsDto {
  @ApiProperty({ type: UserProfileDto })
  @ValidateNested()
  @Type(() => UserProfileDto)
  profile!: UserProfileDto;

  @ApiProperty({ example: 'Cloud Solutions Architect' })
  @IsString()
  @MaxLength(200)
  targetRole!: string;
}

export class RecommendProjectsDto {
  @ApiProperty({ example: ['TypeScript', 'React', 'Node.js'] })
  @IsArray()
  @IsString({ each: true })
  skills!: string[];

  @ApiProperty({ example: 'Full Stack Engineer' })
  @IsString()
  @MaxLength(200)
  targetRole!: string;
}
