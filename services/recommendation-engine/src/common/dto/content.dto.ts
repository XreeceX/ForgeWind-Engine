import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UserProfileDto, CareerGoalsDto } from './shared.dto';

export class RecommendTopicsDto {
  @ApiProperty({ type: UserProfileDto })
  @ValidateNested()
  @Type(() => UserProfileDto)
  profile!: UserProfileDto;
}

export class RecommendPeopleDto {
  @ApiProperty({ type: UserProfileDto })
  @ValidateNested()
  @Type(() => UserProfileDto)
  profile!: UserProfileDto;
}

export class RecommendCompaniesDto {
  @ApiProperty({ type: UserProfileDto })
  @ValidateNested()
  @Type(() => UserProfileDto)
  profile!: UserProfileDto;

  @ApiProperty({ type: CareerGoalsDto })
  @ValidateNested()
  @Type(() => CareerGoalsDto)
  careerGoals!: CareerGoalsDto;
}
