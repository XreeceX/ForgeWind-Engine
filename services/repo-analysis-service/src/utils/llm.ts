import { getAiProvider } from '../providers/ai-provider';

interface LlmRequest<T> {
  agentName: string;
  prompt: string;
  mockResponse: () => T;
  systemPrompt?: string;
  temperature?: number;
}

interface StreamLlmRequest {
  agentName: string;
  prompt: string;
  onToken: (chunk: string) => void;
  systemPrompt?: string;
  temperature?: number;
}

export interface StreamLlmResult {
  text: string;
  status: 'completed' | 'partial_error' | 'failed_empty';
}

export async function callLLM<T>(request: LlmRequest<T>): Promise<unknown> {
  const provider = getAiProvider();
  try {
    return await provider.generateJson({
      prompt: request.prompt,
      temperature: request.temperature,
      systemPrompt: request.systemPrompt,
    });
  } catch (error) {
    if (!process.env['OPENAI_API_KEY']) {
      return request.mockResponse();
    }
    throw error;
  }
}

function withTokenTracking(
  onToken: (chunk: string) => void,
): {
  trackedOnToken: (chunk: string) => void;
  hasEmitted: () => boolean;
  emittedText: () => string;
} {
  let emittedAny = false;
  let text = '';
  return {
    trackedOnToken: (chunk: string) => {
      emittedAny = true;
      text += chunk;
      onToken(chunk);
    },
    hasEmitted: () => emittedAny,
    emittedText: () => text,
  };
}

export async function streamLLMText(
  request: StreamLlmRequest,
): Promise<StreamLlmResult> {
  const provider = getAiProvider();
  const { trackedOnToken, hasEmitted, emittedText } = withTokenTracking(request.onToken);
  try {
    const text = await provider.streamText({
      prompt: request.prompt,
      onToken: trackedOnToken,
      temperature: request.temperature,
      systemPrompt: request.systemPrompt,
    });
    return { text, status: 'completed' };
  } catch {
    if (hasEmitted()) {
      return { text: emittedText(), status: 'partial_error' };
    }
    return { text: '', status: 'failed_empty' };
  }
}
