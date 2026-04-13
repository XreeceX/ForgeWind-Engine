import { BadRequestException, Body, Controller, Get, Post, Query } from '@nestjs/common';
import { z } from 'zod';
import { ContentService } from './content.service';

const generateSchema = z.object({
  userId: z.string().min(1),
  source: z.string().min(1),
  tone: z.string().min(1),
  audience: z.string().min(1),
  context: z.unknown().optional(),
});

@Controller()
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Post('generate/post')
  async generatePost(@Body() body: unknown): Promise<{ content: string }> {
    const parsed = generateSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    return this.contentService.generatePost(parsed.data);
  }

  @Post('generate/article')
  async generateArticle(@Body() body: unknown): Promise<{ content: string }> {
    const parsed = generateSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    return this.contentService.generateArticle(parsed.data);
  }

  @Get('content/history')
  async getHistory(@Query('userId') userId: string): Promise<unknown[]> {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    return this.contentService.getHistory(userId);
  }
}
