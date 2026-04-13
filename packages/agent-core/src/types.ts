import type { ChatCompletionMessageParam } from "openai/resources/chat/completions.js";

export interface Message {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  toolCallId?: string;
  name?: string;
}

export interface Document {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  relevanceScore: number;
}

export interface AgentMemory {
  conversationHistory: Message[];
  shortTermContext: Record<string, unknown>;
  retrievedDocuments: Document[];
}

export interface AgentContext {
  userId: string;
  taskId: string;
  input: Record<string, unknown>;
  memory: AgentMemory;
}

export interface ToolParameterProperty {
  type: string;
  description: string;
  enum?: string[];
  items?: ToolParameterProperty;
}

export interface ToolParameters {
  type: "object";
  properties: Record<string, ToolParameterProperty>;
  required: string[];
}

export interface AgentTool {
  name: string;
  description: string;
  parameters: ToolParameters;
  execute: (params: Record<string, unknown>) => Promise<unknown>;
}

export interface TokenUsage {
  prompt: number;
  completion: number;
}

export interface AgentExecutionResult {
  success: boolean;
  output: unknown;
  reasoning: string;
  confidence: number;
  tokensUsed: TokenUsage;
  durationMs: number;
  toolsUsed: string[];
}

export interface LLMRequestOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
  stream?: boolean;
}

export interface LLMResponse {
  content: string | null;
  toolCalls: LLMToolCall[];
  tokensUsed: TokenUsage;
  finishReason: string;
}

export interface LLMToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export function messagesToChatParams(
  messages: Message[],
): ChatCompletionMessageParam[] {
  return messages.map((msg) => {
    if (msg.role === "tool") {
      return {
        role: "tool" as const,
        content: msg.content,
        tool_call_id: msg.toolCallId ?? "",
      };
    }
    return {
      role: msg.role,
      content: msg.content,
    } as ChatCompletionMessageParam;
  });
}
