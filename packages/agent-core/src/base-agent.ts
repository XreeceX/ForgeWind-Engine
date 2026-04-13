import OpenAI from "openai";
import pino from "pino";
import type {
  AgentContext,
  AgentExecutionResult,
  AgentTool,
  LLMRequestOptions,
  LLMToolCall,
  Message,
  TokenUsage,
} from "./types.js";
import { messagesToChatParams } from "./types.js";
import { LLMClient } from "./llm-client.js";

const MAX_TOOL_ITERATIONS = 10;

export abstract class BaseAgent {
  protected readonly llm: LLMClient;
  protected readonly logger: pino.Logger;
  private readonly agentName: string;

  constructor(openai: OpenAI, agentName: string, logger?: pino.Logger) {
    this.agentName = agentName;
    this.logger =
      logger ??
      pino({
        name: `agent:${agentName}`,
        level: process.env["LOG_LEVEL"] ?? "info",
      });
    this.llm = new LLMClient(openai, this.logger);
  }

  protected abstract getSystemPrompt(context: AgentContext): string;
  protected abstract getTools(): AgentTool[];
  protected abstract buildUserMessage(context: AgentContext): string;

  protected getLLMOptions(): LLMRequestOptions {
    return {};
  }

  async run(context: AgentContext): Promise<AgentExecutionResult> {
    const startTime = Date.now();
    const toolsUsed: string[] = [];
    const aggregatedTokens: TokenUsage = { prompt: 0, completion: 0 };

    this.logger.info(
      { taskId: context.taskId, userId: context.userId },
      `Starting ${this.agentName} execution`,
    );

    try {
      const tools = this.getTools();
      const toolMap = new Map(tools.map((t) => [t.name, t]));

      const messages: Message[] = [
        ...context.memory.conversationHistory,
        { role: "system", content: this.getSystemPrompt(context) },
        { role: "user", content: this.buildUserMessage(context) },
      ];

      if (context.memory.retrievedDocuments.length > 0) {
        const docsContext = context.memory.retrievedDocuments
          .map(
            (doc) =>
              `[Document: ${doc.id} (relevance: ${doc.relevanceScore.toFixed(2)})]\n${doc.content}`,
          )
          .join("\n\n");

        messages.push({
          role: "system",
          content: `Relevant context documents:\n\n${docsContext}`,
        });
      }

      let iteration = 0;
      let finalContent: string | null = null;

      while (iteration < MAX_TOOL_ITERATIONS) {
        iteration++;

        this.logger.debug(
          { iteration, messageCount: messages.length },
          "LLM call iteration",
        );

        const response = await this.llm.chatCompletion(
          messagesToChatParams(messages),
          tools,
          this.getLLMOptions(),
        );

        aggregatedTokens.prompt += response.tokensUsed.prompt;
        aggregatedTokens.completion += response.tokensUsed.completion;

        if (
          response.toolCalls.length === 0 ||
          response.finishReason === "stop"
        ) {
          finalContent = response.content;
          break;
        }

        messages.push({
          role: "assistant",
          content: response.content ?? "",
        });

        const toolResults = await this.executeToolCalls(
          response.toolCalls,
          toolMap,
        );

        for (const result of toolResults) {
          toolsUsed.push(result.toolName);
          messages.push({
            role: "tool",
            content: JSON.stringify(result.output),
            toolCallId: result.toolCallId,
            name: result.toolName,
          });
        }
      }

      if (finalContent === null) {
        this.logger.warn(
          { iteration },
          "Agent exhausted max tool iterations without final response",
        );
        finalContent =
          "Agent reached maximum tool call iterations without producing a final answer.";
      }

      const parsed = this.parseAgentOutput(finalContent);
      const durationMs = Date.now() - startTime;

      this.logger.info(
        {
          taskId: context.taskId,
          durationMs,
          tokensUsed: aggregatedTokens,
          toolsUsed,
          confidence: parsed.confidence,
        },
        `${this.agentName} execution complete`,
      );

      return {
        success: true,
        output: parsed.output,
        reasoning: parsed.reasoning,
        confidence: parsed.confidence,
        tokensUsed: aggregatedTokens,
        durationMs,
        toolsUsed: [...new Set(toolsUsed)],
      };
    } catch (error: unknown) {
      const durationMs = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      this.logger.error(
        { taskId: context.taskId, error: errorMessage, durationMs },
        `${this.agentName} execution failed`,
      );

      return {
        success: false,
        output: null,
        reasoning: `Execution failed: ${errorMessage}`,
        confidence: 0,
        tokensUsed: aggregatedTokens,
        durationMs,
        toolsUsed: [...new Set(toolsUsed)],
      };
    }
  }

  private async executeToolCalls(
    toolCalls: LLMToolCall[],
    toolMap: Map<string, AgentTool>,
  ): Promise<ToolCallResult[]> {
    const results: ToolCallResult[] = [];

    for (const call of toolCalls) {
      const tool = toolMap.get(call.name);
      if (!tool) {
        this.logger.warn({ toolName: call.name }, "Unknown tool requested");
        results.push({
          toolCallId: call.id,
          toolName: call.name,
          output: { error: `Unknown tool: ${call.name}` },
        });
        continue;
      }

      this.logger.debug(
        { toolName: call.name, args: call.arguments },
        "Executing tool",
      );

      try {
        const output = await tool.execute(call.arguments);
        results.push({ toolCallId: call.id, toolName: call.name, output });
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        this.logger.error(
          { toolName: call.name, error: errorMessage },
          "Tool execution failed",
        );
        results.push({
          toolCallId: call.id,
          toolName: call.name,
          output: { error: errorMessage },
        });
      }
    }

    return results;
  }

  private parseAgentOutput(content: string): ParsedOutput {
    try {
      const parsed = JSON.parse(content) as Record<string, unknown>;
      return {
        output: parsed["output"] ?? parsed,
        reasoning: (parsed["reasoning"] as string) ?? "",
        confidence: this.clampConfidence(parsed["confidence"]),
      };
    } catch {
      return {
        output: content,
        reasoning: "",
        confidence: 0.5,
      };
    }
  }

  private clampConfidence(value: unknown): number {
    if (typeof value !== "number" || isNaN(value)) return 0.5;
    return Math.max(0, Math.min(1, value));
  }
}

interface ToolCallResult {
  toolCallId: string;
  toolName: string;
  output: unknown;
}

interface ParsedOutput {
  output: unknown;
  reasoning: string;
  confidence: number;
}
