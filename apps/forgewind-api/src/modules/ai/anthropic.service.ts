import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AnthropicService {
  constructor(private readonly config: ConfigService) {}

  get modelVersion(): string {
    return this.config.get<string>('ANTHROPIC_MODEL') ?? 'claude-3-5-sonnet-20241022';
  }

  async complete(prompt: string, maxTokens = 1024): Promise<string> {
    const apiKey = this.config.get<string>('ANTHROPIC_API_KEY');
    if (!apiKey) {
      throw new ServiceUnavailableException('ANTHROPIC_API_KEY is not configured');
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.modelVersion,
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new ServiceUnavailableException(
        `Anthropic error (${res.status}): ${errText.slice(0, 400)}`,
      );
    }

    const data = (await res.json()) as {
      content?: Array<{ type?: string; text?: string }>;
    };
    const text = data.content?.find((c) => c.type === 'text')?.text?.trim();
    if (!text) {
      throw new ServiceUnavailableException('Anthropic returned an empty response');
    }
    return text;
  }
}
