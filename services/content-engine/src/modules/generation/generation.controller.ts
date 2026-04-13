import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GenerationService } from './services/generation.service';
import {
  GeneratePostDto,
  GenerateHeadlineDto,
  GenerateAboutDto,
  RewriteExperienceDto,
  GenerateColdEmailDto,
  RewriteTextDto,
} from '../../common/dto';
import {
  GeneratedContent,
  GeneratedHeadlines,
  GeneratedAbout,
  RewrittenExperience,
  GeneratedEmail,
  RewrittenText,
} from '../../common/interfaces';

@ApiTags('Generation')
@Controller('generate')
export class GenerationController {
  constructor(private readonly generationService: GenerationService) {}

  @Post('post')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate a LinkedIn post' })
  @ApiResponse({ status: 200, description: 'Generated post with variations and engagement estimate' })
  async generatePost(@Body() dto: GeneratePostDto): Promise<GeneratedContent> {
    return this.generationService.generateLinkedInPost({
      topic: dto.topic,
      tone: dto.tone,
      length: dto.length,
      includeHashtags: dto.includeHashtags,
      includeEmoji: dto.includeEmoji,
      userContext: dto.userContext,
    });
  }

  @Post('headline')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate LinkedIn headline options' })
  @ApiResponse({ status: 200, description: '5 headline options with reasoning' })
  async generateHeadline(@Body() dto: GenerateHeadlineDto): Promise<GeneratedHeadlines> {
    return this.generationService.generateHeadline({
      currentHeadline: dto.currentHeadline,
      role: dto.role,
      industry: dto.industry,
      skills: dto.skills,
      valueProposition: dto.valueProposition,
    });
  }

  @Post('about')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate optimized LinkedIn About section' })
  @ApiResponse({ status: 200, description: 'Optimized About section with keyword highlights' })
  async generateAbout(@Body() dto: GenerateAboutDto): Promise<GeneratedAbout> {
    return this.generationService.generateAboutSection({
      currentAbout: dto.currentAbout,
      role: dto.role,
      industry: dto.industry,
      experience: dto.experience,
      skills: dto.skills,
      achievements: dto.achievements,
      targetAudience: dto.targetAudience,
    });
  }

  @Post('experience')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rewrite experience bullets with action verbs and metrics' })
  @ApiResponse({ status: 200, description: 'Rewritten experience with improvement details' })
  async rewriteExperience(@Body() dto: RewriteExperienceDto): Promise<RewrittenExperience> {
    return this.generationService.rewriteExperience({
      jobTitle: dto.jobTitle,
      company: dto.company,
      originalBullets: dto.originalBullets,
      industry: dto.industry,
      targetRole: dto.targetRole ?? dto.jobTitle,
    });
  }

  @Post('cold-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate a personalized cold email' })
  @ApiResponse({ status: 200, description: 'Email with subject, body, CTA, and follow-up suggestion' })
  async generateColdEmail(@Body() dto: GenerateColdEmailDto): Promise<GeneratedEmail> {
    return this.generationService.generateColdEmail({
      senderName: dto.senderName,
      senderRole: dto.senderRole,
      recipientName: dto.recipientName,
      recipientRole: dto.recipientRole,
      recipientCompany: dto.recipientCompany,
      purpose: dto.purpose,
      commonGround: dto.commonGround,
      tone: dto.tone,
    });
  }

  @Post('rewrite')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rewrite text with a different tone and purpose' })
  @ApiResponse({ status: 200, description: 'Rewritten text with list of changes' })
  async rewriteText(@Body() dto: RewriteTextDto): Promise<RewrittenText> {
    return this.generationService.rewriteText({
      originalText: dto.originalText,
      targetTone: dto.targetTone,
      purpose: dto.purpose,
    });
  }
}
