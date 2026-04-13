import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NetworkingRecommenderService } from './services/networking-recommender.service';
import {
  RecommendConnectionsDto,
  SuggestNetworkingStrategyDto,
} from '../../common/dto';
import {
  ConnectionRecommendation,
  NetworkingStrategy,
} from '../../common/interfaces';

@ApiTags('Networking')
@Controller('networking')
export class NetworkingController {
  constructor(private readonly networkingService: NetworkingRecommenderService) {}

  @Post('connections')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get strategic connection recommendations' })
  @ApiResponse({ status: 200, description: 'Connection targets with approach strategies' })
  async recommendConnections(
    @Body() dto: RecommendConnectionsDto,
  ): Promise<ConnectionRecommendation[]> {
    return this.networkingService.recommendConnections(dto.profile, dto.network);
  }

  @Post('strategy')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate a comprehensive networking strategy' })
  @ApiResponse({ status: 200, description: 'Weekly networking plan with tactics and communities' })
  async suggestStrategy(
    @Body() dto: SuggestNetworkingStrategyDto,
  ): Promise<NetworkingStrategy> {
    return this.networkingService.suggestNetworkingStrategy(dto.profile, dto.goals);
  }
}
