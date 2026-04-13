import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { LinkedInProfile, ProfileAnalysis } from '../interfaces';

/**
 * In-memory store for profiles and analyses.
 * Replace with a proper database-backed repository in production.
 */
@Injectable()
export class ProfileStoreService {
  private readonly logger = new Logger(ProfileStoreService.name);
  private readonly profiles = new Map<string, LinkedInProfile>();
  private readonly analyses = new Map<string, ProfileAnalysis>();

  storeProfile(userId: string, profile: LinkedInProfile): void {
    this.profiles.set(userId, profile);
    this.logger.log(`Stored profile for user ${userId}`);
  }

  getProfile(userId: string): LinkedInProfile {
    const profile = this.profiles.get(userId);
    if (!profile) {
      throw new NotFoundException(`No profile found for user ${userId}`);
    }
    return profile;
  }

  hasProfile(userId: string): boolean {
    return this.profiles.has(userId);
  }

  storeAnalysis(userId: string, analysis: ProfileAnalysis): void {
    this.analyses.set(userId, analysis);
    this.logger.log(`Stored analysis for user ${userId}`);
  }

  getAnalysis(userId: string): ProfileAnalysis {
    const analysis = this.analyses.get(userId);
    if (!analysis) {
      throw new NotFoundException(`No analysis found for user ${userId}`);
    }
    return analysis;
  }
}
