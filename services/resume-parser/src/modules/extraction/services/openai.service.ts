import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

interface CompletionOptions {
  temperature?: number;
  responseFormat?: 'json';
}

const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 1000;

@Injectable()
export class OpenAIService {
  private readonly logger = new Logger(OpenAIService.name);
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(private readonly config: ConfigService) {
    this.client = new OpenAI({
      apiKey: this.config.getOrThrow<string>('OPENAI_API_KEY'),
    });

    this.model = this.config.get<string>('OPENAI_MODEL') ?? 'gpt-4o-mini';
  }

  async complete(
    systemPrompt: string,
    userPrompt: string,
    options?: CompletionOptions,
  ): Promise<string> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await this.client.chat.completions.create({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: options?.temperature ?? 0.1,
          ...(options?.responseFormat === 'json' && {
            response_format: { type: 'json_object' },
          }),
        });

        const content = response.choices[0]?.message?.content;

        if (!content) {
          throw new Error('OpenAI returned an empty response');
        }

        return content;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        const isRateLimit =
          error instanceof OpenAI.APIError && (error.status === 429 || error.status === 503);

        if (isRateLimit && attempt < MAX_RETRIES) {
          const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1);
          this.logger.warn(
            `Rate limited (attempt ${attempt}/${MAX_RETRIES}), retrying in ${delay}ms`,
          );
          await this.sleep(delay);
          continue;
        }

        if (!isRateLimit) {
          break;
        }
      }
    }

    this.logger.error('OpenAI completion failed after retries', lastError?.stack);
    throw lastError;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
