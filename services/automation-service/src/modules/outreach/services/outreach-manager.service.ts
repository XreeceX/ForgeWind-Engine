import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { EmailService } from './email.service';
import {
  Campaign,
  CampaignParams,
  OutreachTarget,
  OutreachResult,
  OutreachResultEntry,
  OutreachHistory,
  OutreachHistoryEntry,
} from '../../../common/interfaces';

const MAX_EMAILS_PER_DAY = 50;
const MAX_TARGETS_PER_CAMPAIGN = 100;

@Injectable()
export class OutreachManagerService {
  private readonly logger = new Logger(OutreachManagerService.name);
  private readonly campaigns = new Map<string, Campaign>();
  private readonly outreachResults = new Map<string, OutreachResultEntry[]>();
  private readonly dailySendCount = new Map<string, number>();

  constructor(private readonly emailService: EmailService) {}

  async createOutreachCampaign(params: CampaignParams): Promise<Campaign> {
    if (params.targets.length > MAX_TARGETS_PER_CAMPAIGN) {
      throw new BadRequestException(
        `Campaign cannot exceed ${MAX_TARGETS_PER_CAMPAIGN} targets`,
      );
    }

    if (params.targets.length === 0) {
      throw new BadRequestException('Campaign must have at least one target');
    }

    const campaign: Campaign = {
      id: randomUUID(),
      userId: params.userId,
      name: params.name,
      targets: params.targets,
      template: params.template,
      status: 'draft',
      createdAt: new Date(),
    };

    this.campaigns.set(campaign.id, campaign);

    this.logger.log(
      `Created campaign "${params.name}" with ${params.targets.length} targets`,
    );

    return campaign;
  }

  async executeOutreach(campaignId: string): Promise<OutreachResult> {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      throw new NotFoundException(`Campaign ${campaignId} not found`);
    }

    if (campaign.status === 'completed') {
      throw new BadRequestException('Campaign has already been completed');
    }

    const dailyKey = this.getDailyKey(campaign.userId);
    const currentCount = this.dailySendCount.get(dailyKey) ?? 0;
    const remaining = MAX_EMAILS_PER_DAY - currentCount;

    if (remaining <= 0) {
      throw new BadRequestException(
        `Daily email limit of ${MAX_EMAILS_PER_DAY} reached. Try again tomorrow.`,
      );
    }

    const targetsToSend = campaign.targets.slice(0, remaining);

    campaign.status = 'active';
    this.campaigns.set(campaignId, campaign);

    const results: OutreachResultEntry[] = [];
    let totalFailed = 0;

    for (const target of targetsToSend) {
      const personalizedBody = this.personalizeTemplate(
        campaign.template,
        target,
      );

      const emailResult = await this.emailService.sendEmail({
        to: target.email,
        subject: this.personalizeTemplate(
          `Reaching out: ${campaign.name}`,
          target,
        ),
        body: personalizedBody,
        replyTo: null,
      });

      if (!emailResult.success) {
        totalFailed++;
      }

      results.push({
        target,
        email: emailResult,
        sentAt: new Date(),
      });
    }

    this.dailySendCount.set(dailyKey, currentCount + targetsToSend.length);

    const existingResults = this.outreachResults.get(campaignId) ?? [];
    this.outreachResults.set(campaignId, [...existingResults, ...results]);

    const allSent =
      existingResults.length + results.length >= campaign.targets.length;
    campaign.status = allSent ? 'completed' : 'paused';
    this.campaigns.set(campaignId, campaign);

    this.logger.log(
      `Executed campaign "${campaign.name}": ${targetsToSend.length - totalFailed} sent, ${totalFailed} failed`,
    );

    return {
      campaignId,
      totalSent: targetsToSend.length - totalFailed,
      totalFailed,
      results,
    };
  }

  async getCampaigns(userId: string): Promise<Campaign[]> {
    return [...this.campaigns.values()].filter((c) => c.userId === userId);
  }

  async getOutreachHistory(userId: string): Promise<OutreachHistory> {
    const userCampaigns = await this.getCampaigns(userId);

    let totalEmailsSent = 0;
    let totalEmailsFailed = 0;

    const campaigns: OutreachHistoryEntry[] = userCampaigns.map((campaign) => {
      const results = this.outreachResults.get(campaign.id) ?? [];
      const sent = results.filter((r) => r.email.success).length;
      const failed = results.filter((r) => !r.email.success).length;

      totalEmailsSent += sent;
      totalEmailsFailed += failed;

      return {
        campaignId: campaign.id,
        campaignName: campaign.name,
        totalTargets: campaign.targets.length,
        totalSent: sent,
        totalFailed: failed,
        status: campaign.status,
        createdAt: campaign.createdAt,
      };
    });

    const totalAttempted = totalEmailsSent + totalEmailsFailed;
    const overallSuccessRate =
      totalAttempted > 0
        ? Math.round((totalEmailsSent / totalAttempted) * 100)
        : 0;

    return {
      campaigns,
      totalCampaigns: userCampaigns.length,
      totalEmailsSent,
      overallSuccessRate,
    };
  }

  private personalizeTemplate(
    template: string,
    target: OutreachTarget,
  ): string {
    let result = template;

    result = result.replace(/\{\{name\}\}/g, target.name);
    result = result.replace(/\{\{company\}\}/g, target.company);
    result = result.replace(/\{\{role\}\}/g, target.role);
    result = result.replace(/\{\{email\}\}/g, target.email);

    for (const [key, value] of Object.entries(target.personalization)) {
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    }

    return result;
  }

  private getDailyKey(userId: string): string {
    const today = new Date().toISOString().split('T')[0];
    return `${userId}:${today}`;
  }
}
