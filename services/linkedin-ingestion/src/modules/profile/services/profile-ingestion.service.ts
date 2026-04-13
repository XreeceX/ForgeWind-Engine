import {
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { LinkedInDataParserService } from './linkedin-data-parser.service';
import { ProfileStoreService } from '../../../common/services/profile-store.service';
import {
  LinkedInProfile,
  LinkedInExportData,
} from '../../../common/interfaces';

const LINKEDIN_URL_PATTERN = /^https:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/;

@Injectable()
export class ProfileIngestionService {
  private readonly logger = new Logger(ProfileIngestionService.name);

  constructor(
    private readonly parser: LinkedInDataParserService,
    private readonly store: ProfileStoreService,
  ) {}

  async ingestFromExport(userId: string, buffer: Buffer): Promise<LinkedInProfile> {
    this.logger.log(`Ingesting LinkedIn export for user ${userId}`);

    const exportData = await this.parser.parseExportZip(buffer);
    const profile = this.buildProfileFromExport(userId, exportData);

    this.store.storeProfile(userId, profile);
    this.logger.log(`Successfully ingested export for user ${userId}: ${profile.firstName} ${profile.lastName}`);

    return profile;
  }

  async ingestFromText(userId: string, text: string): Promise<LinkedInProfile> {
    this.logger.log(`Ingesting profile from text for user ${userId}`);

    if (!text.trim()) {
      throw new BadRequestException('Profile text cannot be empty');
    }

    const parsed = await this.parser.parseRawProfile(text);
    const profile = this.buildProfileFromParsed(userId, parsed);

    this.store.storeProfile(userId, profile);
    this.logger.log(`Successfully ingested text profile for user ${userId}`);

    return profile;
  }

  async ingestFromUrl(userId: string, profileUrl: string): Promise<LinkedInProfile> {
    this.logger.log(`Ingesting profile URL for user ${userId}: ${profileUrl}`);

    if (!LINKEDIN_URL_PATTERN.test(profileUrl)) {
      throw new BadRequestException(
        'Invalid LinkedIn URL format. Expected: https://linkedin.com/in/username',
      );
    }

    const profile: LinkedInProfile = {
      userId,
      firstName: '',
      lastName: '',
      headline: '',
      summary: '',
      emailAddress: '',
      location: '',
      industry: '',
      profileUrl,
      positions: [],
      education: [],
      skills: [],
      endorsements: [],
      connections: [],
      ingestedAt: new Date(),
      source: 'url',
    };

    this.store.storeProfile(userId, profile);
    this.logger.log(`Stored URL profile for user ${userId} — awaiting future processing`);

    return profile;
  }

  private buildProfileFromExport(
    userId: string,
    data: LinkedInExportData,
  ): LinkedInProfile {
    return {
      userId,
      firstName: data.profile.firstName,
      lastName: data.profile.lastName,
      headline: data.profile.headline,
      summary: data.profile.summary,
      emailAddress: data.profile.emailAddress,
      location: data.profile.location,
      industry: data.profile.industry,
      profileUrl: data.profile.profileUrl,
      positions: data.positions,
      education: data.education,
      skills: data.skills,
      endorsements: data.endorsements,
      connections: data.connections,
      ingestedAt: new Date(),
      source: 'export',
    };
  }

  private buildProfileFromParsed(
    userId: string,
    parsed: Partial<LinkedInProfile>,
  ): LinkedInProfile {
    return {
      userId,
      firstName: parsed.firstName ?? '',
      lastName: parsed.lastName ?? '',
      headline: parsed.headline ?? '',
      summary: parsed.summary ?? '',
      emailAddress: parsed.emailAddress ?? '',
      location: parsed.location ?? '',
      industry: parsed.industry ?? '',
      profileUrl: parsed.profileUrl ?? '',
      positions: parsed.positions ?? [],
      education: parsed.education ?? [],
      skills: parsed.skills ?? [],
      endorsements: parsed.endorsements ?? [],
      connections: parsed.connections ?? [],
      ingestedAt: new Date(),
      source: 'text',
    };
  }
}
