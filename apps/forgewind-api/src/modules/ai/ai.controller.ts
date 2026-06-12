import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnthropicService } from './anthropic.service';

class ChatDto {
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  message!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  repoContext?: string;
}

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly anthropic: AnthropicService) {}

  @Post('chat')
  async chat(@Body() body: ChatDto) {
    const prompt = [
      'You are ForgeWind AI Copilot — a concise, actionable career coach for software engineers.',
      'Help with profile optimization, job search, repo storytelling, and interview prep.',
      body.repoContext ? `Active repository context: ${body.repoContext}` : null,
      `User message: ${body.message}`,
    ]
      .filter(Boolean)
      .join('\n\n');

    const content = await this.anthropic.complete(prompt, 1024);
    return { content };
  }
}
