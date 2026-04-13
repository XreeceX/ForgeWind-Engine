import { Injectable } from '@nestjs/common';
import { PrismaService } from './common/prisma.service';
import { AiProvider } from './ai-provider';
import { linkedinPostTemplate } from './templates/linkedin-post.template';
import { articleTemplate } from './templates/article.template';

interface GenerateInput {
  userId: string;
  source: string;
  tone: string;
  audience: string;
  context?: unknown;
}

@Injectable()
export class ContentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiProvider: AiProvider,
  ) {}

  async generatePost(input: GenerateInput): Promise<{ content: string }> {
    const prompt = linkedinPostTemplate(input);
    const content = await this.aiProvider.generate(prompt);
    await this.persistGeneratedContent(input.userId, 'post', input.source, content);

    return { content };
  }

  async generateArticle(input: GenerateInput): Promise<{ content: string }> {
    const prompt = articleTemplate(input);
    const content = await this.aiProvider.generate(prompt);
    await this.persistGeneratedContent(input.userId, 'article', input.source, content);

    return { content };
  }

  async getHistory(userId: string): Promise<unknown[]> {
    return this.prisma.generatedContent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  private async persistGeneratedContent(
    userId: string,
    type: string,
    source: string,
    content: string,
  ): Promise<void> {
    await this.prisma.generatedContent.create({
      data: {
        userId,
        type,
        source,
        content,
      },
    });
  }
}
