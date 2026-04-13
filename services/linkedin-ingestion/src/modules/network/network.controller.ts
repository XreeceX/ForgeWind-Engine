import { Body, Controller, Post } from '@nestjs/common';
import { NetworkService } from './network.service';
import { AnalyzeNetworkDto } from '../../common/dto';
import { NetworkAnalysis } from '../../common/interfaces';

@Controller('network')
export class NetworkController {
  constructor(private readonly networkService: NetworkService) {}

  @Post('analyze')
  async analyzeNetwork(@Body() dto: AnalyzeNetworkDto): Promise<NetworkAnalysis> {
    return this.networkService.analyzeNetwork(dto.connections);
  }
}
