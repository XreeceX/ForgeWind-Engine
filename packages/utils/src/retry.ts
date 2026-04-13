export interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

const DEFAULT_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10_000,
};

/**
 * Retries an async function with exponential backoff and jitter.
 * The delay between retries doubles each attempt (capped at `maxDelay`)
 * with random jitter to prevent thundering-herd effects.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {},
): Promise<T> {
  const { maxRetries, baseDelay, maxDelay } = { ...DEFAULT_OPTIONS, ...options };
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) break;

      const exponentialDelay = baseDelay * 2 ** attempt;
      const jitter = Math.random() * exponentialDelay * 0.5;
      const delay = Math.min(exponentialDelay + jitter, maxDelay);

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
