import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UserProfileDto, CareerGoalsDto, NetworkAnalysisDto } from './shared.dto';

export class RecommendConnectionsDto {
  @ApiProperty({ type: UserProfileDto })
  @ValidateNested()
  @Type(() => UserProfileDto)
  profile!: UserProfileDto;

  @ApiProperty({ type: NetworkAnalysisDto })
  @ValidateNested()
  @Type(() => NetworkAnalysisDto)
  network!: NetworkAnalysisDto;
}

export class SuggestNetworkingStrategyDto {
  @ApiProperty({ type: UserProfileDto })
  @ValidateNested()
  @Type(() => UserProfileDto)
  profile!: UserProfileDto;

  @ApiProperty({ type: CareerGoalsDto })
  @ValidateNested()
  @Type(() => CareerGoalsDto)
  goals!: CareerGoalsDto;
}
