import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { OutreachManagerService } from './services/outreach-manager.service';
import { CreateCampaignDto } from '../../common/dto';

@ApiTags('Outreach')
@Controller('outreach')
export class OutreachController {
  constructor(
    private readonly outreachManager: OutreachManagerService,
  ) {}

  @Post('campaigns')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new outreach campaign' })
  @ApiResponse({ status: 201, description: 'Campaign created' })
  async createCampaign(@Body() dto: CreateCampaignDto) {
    const campaign = await this.outreachManager.createOutreachCampaign({
      userId: dto.userId,
      name: dto.name,
      targets: dto.targets.map((t) => ({
        ...t,
        personalization: t.personalization ?? {},
      })),
      template: dto.template,
    });
    return { success: true, campaign };
  }

  @Post('campaigns/:id/execute')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute an outreach campaign' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({ status: 200, description: 'Campaign executed' })
  async executeCampaign(@Param('id') id: string) {
    const result = await this.outreachManager.executeOutreach(id);
    return { success: true, result };
  }

  @Get('campaigns')
  @ApiOperation({ summary: 'List campaigns for a user' })
  @ApiResponse({ status: 200, description: 'Campaigns retrieved' })
  async getCampaigns(@Query('userId') userId: string) {
    const campaigns = await this.outreachManager.getCampaigns(userId);
    return { campaigns, total: campaigns.length };
  }

  @Get('history/:userId')
  @ApiOperation({ summary: 'Get outreach history for a user' })
  @ApiParam({ name: 'userId', description: 'Target user ID' })
  @ApiResponse({ status: 200, description: 'Outreach history retrieved' })
  async getHistory(@Param('userId') userId: string) {
    const history = await this.outreachManager.getOutreachHistory(userId);
    return { history };
  }
}
