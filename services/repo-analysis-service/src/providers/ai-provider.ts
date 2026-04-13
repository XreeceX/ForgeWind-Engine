import OpenAI from 'openai';

interface JsonGenerationRequest {
  prompt: string;
  temperature?: number;
  systemPrompt?: string;
}

interface StreamTextRequest {
  prompt: string;
  temperature?: number;
  systemPrompt?: string;
  onToken: (token: string) => void;
}

export interface AiProvider {
  generateJson(request: JsonGenerationRequest): Promise<unknown>;
  streamText(request: StreamTextRequest): Promise<string>;
}

class OpenAiProvider implements AiProvider {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(apiKey: string, model: string) {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async generateJson(request: JsonGenerationRequest): Promise<unknown> {
    const completion = await this.client.chat.completions.create({
      model: this.model,
      temperature: request.temperature ?? 0.3,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            request.systemPrompt ??
            'You are an expert software architect and technical storyteller. Return only valid JSON.',
        },
        {
          role: 'user',
          content: request.prompt,
        },
      ],
    });

    const content = completion.choices[0]?.message.content;
    if (!content) {
      throw new Error('Provider returned empty JSON response.');
    }

    return JSON.parse(content);
  }

  async streamText(request: StreamTextRequest): Promise<string> {
    const stream = await this.client.chat.completions.create({
      model: this.model,
      temperature: request.temperature ?? 0.4,
      stream: true,
      messages: [
        {
          role: 'system',
          content:
            request.systemPrompt ??
            'You are an expert technical writer. Produce polished, concise output.',
        },
        {
          role: 'user',
          content: request.prompt,
        },
      ],
    });

    let text = '';
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content ?? '';
      if (!delta) {
        continue;
      }

      text += delta;
      request.onToken(delta);
    }

    return text;
  }
}

class DisabledAiProvider implements AiProvider {
  async generateJson(): Promise<unknown> {
    throw new Error('OPENAI_API_KEY is not configured.');
  }

  async streamText(): Promise<string> {
    throw new Error('OPENAI_API_KEY is not configured.');
  }
}

let providerSingleton: AiProvider | null = null;

export function getAiProvider(): AiProvider {
  if (providerSingleton) {
    return providerSingleton;
  }

  const apiKey = process.env['OPENAI_API_KEY'];
  const model = process.env['OPENAI_MODEL'] ?? 'gpt-4o-mini';
  providerSingleton = apiKey ? new OpenAiProvider(apiKey, model) : new DisabledAiProvider();

  return providerSingleton;
}
