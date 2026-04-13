import type {
  AiStreamEvent,
  CreateAiSessionPayload,
} from "@/types/ai-stream";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export async function createAiSession(
  payload: CreateAiSessionPayload,
  accessToken: string
): Promise<{ sessionId: string }> {
  const response = await fetch(`${API_BASE_URL}/ai/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to create AI session: ${response.status}`);
  }

  return (await response.json()) as { sessionId: string };
}

interface StreamAiSessionParams {
  sessionId: string;
  accessToken: string;
  onEvent: (event: AiStreamEvent) => void;
  onError?: (error: Error) => void;
  onDone?: () => void;
}

export async function streamAiSession({
  sessionId,
  accessToken,
  onEvent,
  onError,
  onDone,
}: StreamAiSessionParams): Promise<() => void> {
  const stop = streamAiSessionSync({
    sessionId,
    accessToken,
    onEvent,
    onError,
    onDone,
  });
  return Promise.resolve(stop);
}

export function streamAiSessionSync({
  sessionId,
  accessToken,
  onEvent,
  onError,
  onDone,
}: StreamAiSessionParams): () => void {
  const controller = new AbortController();

  void (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/sessions/${sessionId}/stream`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "text/event-stream",
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Failed to open AI stream: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("AI stream body is unavailable");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (!controller.signal.aborted) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() ?? "";

        for (const chunk of chunks) {
          const event = parseSseChunk(chunk);
          if (event) {
            onEvent(event);
          }
        }
      }

      onDone?.();
    } catch (error) {
      if (!controller.signal.aborted) {
        onError?.(error instanceof Error ? error : new Error("Unknown stream error"));
      }
    }
  })();

  return () => controller.abort();
}

function parseSseChunk(chunk: string): AiStreamEvent | null {
  const lines = chunk.split("\n");
  const dataLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trim());
    }
  }

  if (!dataLines.length) return null;

  try {
    return JSON.parse(dataLines.join("")) as AiStreamEvent;
  } catch {
    return null;
  }
}
