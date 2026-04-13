import { ZodSchema } from 'zod';

interface ValidationRequest<T> {
  agentName: string;
  schema: ZodSchema<T>;
  invoke: () => Promise<unknown>;
  fallback: () => T;
  retries?: number;
}

export interface ValidationResult<T> {
  data: T;
  errors: string[];
  usedFallback: boolean;
}

export async function validateWithRetry<T>(
  request: ValidationRequest<T>,
): Promise<ValidationResult<T>> {
  const retries = request.retries ?? 2;
  const errors: string[] = [];

  for (let attempt = 1; attempt <= retries + 1; attempt += 1) {
    try {
      const candidate = await request.invoke();
      const parsed = request.schema.safeParse(candidate);
      if (parsed.success) {
        return { data: parsed.data, errors, usedFallback: false };
      }

      errors.push(
        `[${request.agentName}] Invalid schema on attempt ${attempt}: ${parsed.error.issues
          .map((issue) => issue.message)
          .join(', ')}`,
      );
    } catch (error) {
      errors.push(
        `[${request.agentName}] LLM failure on attempt ${attempt}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  return {
    data: request.fallback(),
    errors: [...errors, `[${request.agentName}] Using fallback response after retries.`],
    usedFallback: true,
  };
}
