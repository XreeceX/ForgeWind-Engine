import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  CurrentUser,
  AuthenticatedUser,
} from '../../common/decorators/current-user.decorator';
import {
  GenerateContentDto,
  RewriteContentDto,
  GeneratedContent,
  ContentStrategy,
  ContentTemplate,
  RewriteResult,
  ContentType,
} from './content.dto';

@ApiTags('Content')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('content')
export class ContentController {
  @Post('generate')
  @ApiOperation({ summary: 'Generate AI-powered content' })
  @ApiCreatedResponse({ description: 'Content generated' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  generate(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: GenerateContentDto,
  ): GeneratedContent {
    // TODO: Forward to content-service POST /content/generate
    void user;
    return {
      id: 'cnt_001',
      type: dto.type,
      content:
        dto.type === ContentType.LINKEDIN_POST
          ? "🚀 Hot take: AI won't replace recruiters — but recruiters who use AI will replace those who don't.\n\nHere's what I've learned building AI tools for talent acquisition..."
          : 'Results-driven engineer with 8+ years shipping products used by millions.',
      alternatives: [
        'Passionate about building AI-powered career tools that level the playing field.',
        'Engineering leader specializing in developer experience and AI applications.',
      ],
      metadata: {
        readabilityScore: 82,
        estimatedEngagement: 'high',
        wordCount: 42,
        hashtags: ['#AI', '#Recruiting', '#CareerTech', '#FutureOfWork'],
      },
    };
  }

  @Get('strategy')
  @ApiOperation({ summary: 'Get personalized content posting strategy' })
  @ApiOkResponse({ description: 'Content strategy' })
  getStrategy(
    @CurrentUser() user: AuthenticatedUser,
  ): ContentStrategy {
    // TODO: Forward to content-service GET /content/strategy/:userId
    void user;
    return {
      weeklyPlan: [
        { day: 'Monday', contentType: ContentType.LINKEDIN_POST, topic: 'Industry insights', notes: 'Share a lesson learned' },
        { day: 'Wednesday', contentType: ContentType.LINKEDIN_POST, topic: 'Technical deep-dive', notes: 'Code snippet or architecture decision' },
        { day: 'Friday', contentType: ContentType.LINKEDIN_POST, topic: 'Career reflection', notes: 'Personal growth story' },
      ],
      themes: ['AI/ML engineering', 'Career development', 'Technical leadership'],
      bestPostingTimes: ['Tuesday 8:00 AM EST', 'Wednesday 12:00 PM EST', 'Thursday 9:00 AM EST'],
      audienceInsights: [
        'Your network is 60% engineers, 25% recruiters, 15% founders',
        'Technical content gets 2x more engagement than general career posts',
      ],
    };
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get content templates' })
  @ApiOkResponse({ description: 'Available templates' })
  getTemplates(
    @CurrentUser() user: AuthenticatedUser,
  ): ContentTemplate[] {
    // TODO: Forward to content-service GET /content/templates
    void user;
    return [
      {
        id: 'tpl_001',
        name: 'Achievement Post',
        type: ContentType.LINKEDIN_POST,
        template: "I'm thrilled to share that {{achievement}}.\n\nThis journey taught me:\n1. {{lesson1}}\n2. {{lesson2}}\n3. {{lesson3}}\n\n{{callToAction}}",
        description: 'Share a professional achievement with your network',
        variables: ['achievement', 'lesson1', 'lesson2', 'lesson3', 'callToAction'],
      },
      {
        id: 'tpl_002',
        name: 'Compelling Headline',
        type: ContentType.HEADLINE,
        template: '{{role}} | {{specialty}} | {{value_prop}}',
        description: 'Structured headline with role, specialty, and value proposition',
        variables: ['role', 'specialty', 'value_prop'],
      },
      {
        id: 'tpl_003',
        name: 'Cold Outreach',
        type: ContentType.COLD_EMAIL,
        template: 'Hi {{name}},\n\nI noticed {{observation}}. I {{connection_point}}.\n\n{{value_offer}}\n\nWould you be open to a quick chat?\n\nBest,\n{{sender}}',
        description: 'Personalized cold email template',
        variables: ['name', 'observation', 'connection_point', 'value_offer', 'sender'],
      },
    ];
  }

  @Post('rewrite')
  @ApiOperation({ summary: 'Rewrite existing text with AI improvements' })
  @ApiCreatedResponse({ description: 'Text rewritten' })
  rewrite(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RewriteContentDto,
  ): RewriteResult {
    // TODO: Forward to content-service POST /content/rewrite
    void user;
    return {
      original: dto.text,
      rewritten:
        'Delivered 15+ full-stack projects across fintech and healthtech, reducing deployment cycles by 60% through CI/CD automation and mentoring a team of 4 junior developers.',
      improvements: [
        'Added quantified outcomes (15+ projects, 60% reduction)',
        'Specified industries for credibility',
        'Included leadership element (mentoring)',
        'Used action verbs (Delivered, reducing, mentoring)',
      ],
    };
  }
}
