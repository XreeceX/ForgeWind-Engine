import OpenAI from 'openai';
import type {
  ChatCompletionTool,
  ChatCompletionMessageParam,
} from 'openai/resources/chat/completions.js';
import pino from 'pino';
import type {
  AgentTool,
  LLMRequestOptions,
  LLMResponse,
  LLMToolCall,
  TokenUsage,
} from './types.js';

const DEFAULT_MODEL = 'gpt-4o';
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS = 4096;
const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 1000;

export class LLMClient {
  private readonly client: OpenAI;
  private readonly logger: pino.Logger;
  private totalTokensUsed: TokenUsage = { prompt: 0, completion: 0 };

  constructor(client: OpenAI, logger?: pino.Logger) {
    this.client = client;
    this.logger = logger ?? pino({ name: 'llm-client', level: process.env['LOG_LEVEL'] ?? 'info' });
  }

  async chatCompletion(
    messages: ChatCompletionMessageParam[],
    tools: AgentTool[],
    options: LLMRequestOptions = {},
  ): Promise<LLMResponse> {
    const model = options.model ?? DEFAULT_MODEL;
    const temperature = options.temperature ?? DEFAULT_TEMPERATURE;
    const maxTokens = options.maxTokens ?? DEFAULT_MAX_TOKENS;

    const openaiTools: ChatCompletionTool[] = tools.map((tool) => ({
      type: 'function' as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters as unknown as Record<string, unknown>,
      },
    }));

    let lastError: Error | undefined;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        this.logger.debug(
          { model, attempt, messageCount: messages.length },
          'Sending chat completion request',
        );

        const response = await this.client.chat.completions.create({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
          ...(openaiTools.length > 0 && { tools: openaiTools }),
          ...(options.jsonMode && {
            response_format: { type: 'json_object' },
          }),
        });

        const choice = response.choices[0];
        if (!choice) {
          throw new Error('No completion choice returned from LLM');
        }

        const tokensUsed: TokenUsage = {
          prompt: response.usage?.prompt_tokens ?? 0,
          completion: response.usage?.completion_tokens ?? 0,
        };

        this.totalTokensUsed.prompt += tokensUsed.prompt;
        this.totalTokensUsed.completion += tokensUsed.completion;

        const toolCalls: LLMToolCall[] = (choice.message.tool_calls ?? [])
          .filter((tc): tc is Extract<typeof tc, { type: 'function' }> => tc.type === 'function')
          .map((tc) => ({
            id: tc.id,
            name: tc.function.name,
            arguments: JSON.parse(tc.function.arguments) as Record<string, unknown>,
          }));

        this.logger.debug(
          {
            tokensUsed,
            toolCallCount: toolCalls.length,
            finishReason: choice.finish_reason,
          },
          'Chat completion received',
        );

        return {
          content: choice.message.content,
          toolCalls,
          tokensUsed,
          finishReason: choice.finish_reason,
        };
      } catch (error: unknown) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (this.isRateLimitError(error)) {
          const backoffMs = BASE_BACKOFF_MS * Math.pow(2, attempt);
          this.logger.warn({ attempt, backoffMs }, 'Rate limited, backing off');
          await this.sleep(backoffMs);
          continue;
        }

        if (this.isRetryableError(error) && attempt < MAX_RETRIES - 1) {
          const backoffMs = BASE_BACKOFF_MS * Math.pow(2, attempt);
          this.logger.warn(
            { attempt, backoffMs, error: lastError.message },
            'Retryable error, backing off',
          );
          await this.sleep(backoffMs);
          continue;
        }

        throw lastError;
      }
    }

    throw lastError ?? new Error('LLM request failed after max retries');
  }

  async streamCompletion(
    messages: ChatCompletionMessageParam[],
    tools: AgentTool[],
    options: LLMRequestOptions = {},
    onChunk: (chunk: string) => void,
  ): Promise<LLMResponse> {
    const model = options.model ?? DEFAULT_MODEL;
    const temperature = options.temperature ?? DEFAULT_TEMPERATURE;
    const maxTokens = options.maxTokens ?? DEFAULT_MAX_TOKENS;

    const openaiTools: ChatCompletionTool[] = tools.map((tool) => ({
      type: 'function' as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters as unknown as Record<string, unknown>,
      },
    }));

    const stream = await this.client.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
      ...(openaiTools.length > 0 && { tools: openaiTools }),
    });

    let fullContent = '';
    const toolCallAccumulators = new Map<number, { id: string; name: string; arguments: string }>();
    let finishReason = 'stop';

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;
      if (!delta) continue;

      if (delta.content) {
        fullContent += delta.content;
        onChunk(delta.content);
      }

      if (delta.tool_calls) {
        for (const tc of delta.tool_calls) {
          const existing = toolCallAccumulators.get(tc.index);
          if (existing) {
            existing.arguments += tc.function?.arguments ?? '';
          } else {
            toolCallAccumulators.set(tc.index, {
              id: tc.id ?? '',
              name: tc.function?.name ?? '',
              arguments: tc.function?.arguments ?? '',
            });
          }
        }
      }

      if (chunk.choices[0]?.finish_reason) {
        finishReason = chunk.choices[0].finish_reason;
      }
    }

    const toolCalls: LLMToolCall[] = Array.from(toolCallAccumulators.values()).map((tc) => ({
      id: tc.id,
      name: tc.name,
      arguments: JSON.parse(tc.arguments) as Record<string, unknown>,
    }));

    return {
      content: fullContent || null,
      toolCalls,
      tokensUsed: { prompt: 0, completion: 0 },
      finishReason,
    };
  }

  getTotalTokensUsed(): TokenUsage {
    return { ...this.totalTokensUsed };
  }

  resetTokenCounter(): void {
    this.totalTokensUsed = { prompt: 0, completion: 0 };
  }

  private isRateLimitError(error: unknown): boolean {
    if (error instanceof OpenAI.APIError) {
      return error.status === 429;
    }
    return false;
  }

  private isRetryableError(error: unknown): boolean {
    if (error instanceof OpenAI.APIError) {
      return error.status >= 500 || error.status === 429;
    }
    return false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
