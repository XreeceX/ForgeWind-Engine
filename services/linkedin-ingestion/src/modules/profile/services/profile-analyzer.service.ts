import { Injectable, Logger } from '@nestjs/common';
import { OpenAIService } from '../../../common/services/openai.service';
import { ProfileStoreService } from '../../../common/services/profile-store.service';
import { LinkedInProfile } from '../../../common/interfaces';
import {
  ProfileAnalysis,
  SuggestedAction,
  SectionScore,
  CompletenessScore,
} from '../../../common/interfaces';

interface LLMProfileAnalysis {
  overallScore: number;
  headlineScore: { score: number; suggestions: string[] };
  aboutScore: { score: number; suggestions: string[] };
  experienceScore: { score: number; suggestions: string[] };
  skillsScore: { score: number; suggestions: string[] };
  completenessScore: { score: number; missingFields: string[] };
  keyStrengths: string[];
  improvementAreas: string[];
  industryAlignment: string;
  recommendedActions: {
    category: string;
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    estimatedImpact: string;
  }[];
}

const ANALYSIS_SYSTEM_PROMPT = `You are a LinkedIn profile optimization expert. Analyze the provided LinkedIn profile data and return a comprehensive JSON analysis.

Evaluate the profile on these dimensions:
1. **Headline** (0-100): Is it compelling, keyword-rich, and value-oriented? Does it go beyond just a job title?
2. **About/Summary** (0-100): Is it engaging, clear, and does it articulate value proposition? Does it include relevant keywords?
3. **Experience** (0-100): Are descriptions achievement-oriented with quantifiable results? Is the career narrative coherent?
4. **Skills** (0-100): Are skills relevant, comprehensive, and strategically ordered? Are there enough endorsements?
5. **Completeness** (0-100): Which standard fields are missing or empty?

Also assess:
- Key strengths the profile demonstrates
- Areas needing improvement
- How well the profile aligns with the stated/implied industry
- Specific recommended actions with priority and estimated impact

Return ONLY a valid JSON object with this exact structure:
{
  "overallScore": number,
  "headlineScore": { "score": number, "suggestions": string[] },
  "aboutScore": { "score": number, "suggestions": string[] },
  "experienceScore": { "score": number, "suggestions": string[] },
  "skillsScore": { "score": number, "suggestions": string[] },
  "completenessScore": { "score": number, "missingFields": string[] },
  "keyStrengths": string[],
  "improvementAreas": string[],
  "industryAlignment": string,
  "recommendedActions": [{ "category": string, "priority": "high"|"medium"|"low", "title": string, "description": string, "estimatedImpact": string }]
}`;

@Injectable()
export class ProfileAnalyzerService {
  private readonly logger = new Logger(ProfileAnalyzerService.name);

  constructor(
    private readonly openAIService: OpenAIService,
    private readonly store: ProfileStoreService,
  ) {}

  async analyzeProfile(profile: LinkedInProfile): Promise<ProfileAnalysis> {
    this.logger.log(`Analyzing profile for user ${profile.userId}`);

    const profileSummary = this.buildProfileSummary(profile);
    const llmResult = await this.openAIService.jsonCompletion<LLMProfileAnalysis>(
      ANALYSIS_SYSTEM_PROMPT,
      profileSummary,
    );

    const analysis = this.mapToProfileAnalysis(profile.userId, llmResult);

    this.store.storeAnalysis(profile.userId, analysis);
    this.logger.log(`Analysis complete for user ${profile.userId}: overall score ${analysis.overallScore}`);

    return analysis;
  }

  async analyzeByUserId(userId: string): Promise<ProfileAnalysis> {
    const profile = this.store.getProfile(userId);
    return this.analyzeProfile(profile);
  }

  getAnalysis(userId: string): ProfileAnalysis {
    return this.store.getAnalysis(userId);
  }

  private buildProfileSummary(profile: LinkedInProfile): string {
    const sections: string[] = [];

    sections.push(`Name: ${profile.firstName} ${profile.lastName}`);
    sections.push(`Headline: ${profile.headline || '(empty)'}`);
    sections.push(`Location: ${profile.location || '(empty)'}`);
    sections.push(`Industry: ${profile.industry || '(empty)'}`);
    sections.push(`Summary/About: ${profile.summary || '(empty)'}`);

    if (profile.positions.length > 0) {
      sections.push('\nExperience:');
      for (const pos of profile.positions) {
        const dateRange = pos.endDate
          ? `${pos.startDate} - ${pos.endDate}`
          : `${pos.startDate} - Present`;
        sections.push(`- ${pos.title} at ${pos.company} (${dateRange})`);
        if (pos.description) {
          sections.push(`  ${pos.description}`);
        }
      }
    } else {
      sections.push('\nExperience: (none listed)');
    }

    if (profile.education.length > 0) {
      sections.push('\nEducation:');
      for (const edu of profile.education) {
        sections.push(`- ${edu.degree} in ${edu.fieldOfStudy} at ${edu.school} (${edu.startDate} - ${edu.endDate})`);
      }
    } else {
      sections.push('\nEducation: (none listed)');
    }

    if (profile.skills.length > 0) {
      sections.push(`\nSkills (${profile.skills.length}): ${profile.skills.map((s) => s.name).join(', ')}`);
    } else {
      sections.push('\nSkills: (none listed)');
    }

    sections.push(`\nConnections: ${profile.connections.length}`);
    sections.push(`Endorsements: ${profile.endorsements.length}`);

    return sections.join('\n');
  }

  private mapToProfileAnalysis(
    userId: string,
    llm: LLMProfileAnalysis,
  ): ProfileAnalysis {
    const clampScore = (score: number): number =>
      Math.max(0, Math.min(100, Math.round(score)));

    const mapSectionScore = (section: { score: number; suggestions: string[] }): SectionScore => ({
      score: clampScore(section.score),
      suggestions: section.suggestions,
    });

    const mapCompletenessScore = (section: { score: number; missingFields: string[] }): CompletenessScore => ({
      score: clampScore(section.score),
      missingFields: section.missingFields,
    });

    const mapActions = (
      actions: LLMProfileAnalysis['recommendedActions'],
    ): SuggestedAction[] =>
      actions.map((action) => ({
        category: action.category,
        priority: action.priority,
        title: action.title,
        description: action.description,
        estimatedImpact: action.estimatedImpact,
      }));

    return {
      userId,
      overallScore: clampScore(llm.overallScore),
      headlineScore: mapSectionScore(llm.headlineScore),
      aboutScore: mapSectionScore(llm.aboutScore),
      experienceScore: mapSectionScore(llm.experienceScore),
      skillsScore: mapSectionScore(llm.skillsScore),
      completenessScore: mapCompletenessScore(llm.completenessScore),
      keyStrengths: llm.keyStrengths,
      improvementAreas: llm.improvementAreas,
      industryAlignment: llm.industryAlignment,
      recommendedActions: mapActions(llm.recommendedActions),
      analyzedAt: new Date(),
    };
  }
}
