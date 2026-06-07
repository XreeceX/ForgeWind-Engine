import { z } from 'zod';

export const baseEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

// Plain ZodObject — no superRefine so .merge() works correctly downstream.
export const databaseEnvSchema = z.object({
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid connection string'),
});

export const jwtEnvSchema = z.object({
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
});

export const authEnvSchema = z.object({
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRATION: z.string().default('7d'),
  LINKEDIN_CLIENT_ID: z.string().optional(),
  LINKEDIN_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
});

export const serviceEnvSchema = baseEnvSchema;

// Merge first, then apply superRefine for the localhost production guard.
export const databaseServiceEnvSchema = baseEnvSchema
  .merge(databaseEnvSchema)
  .superRefine((data, ctx) => {
    if (data.NODE_ENV !== 'production') return;
    try {
      const host = new URL(data.DATABASE_URL).hostname;
      if (host === 'localhost' || host === '127.0.0.1') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'DATABASE_URL must not point at localhost in production — set your Neon pooled URL in Railway/Vercel',
          path: ['DATABASE_URL'],
        });
      }
    } catch {
      // url() already validated the format
    }
  });

export const userServiceEnvSchema = baseEnvSchema
  .merge(databaseEnvSchema)
  .merge(jwtEnvSchema)
  .superRefine((data, ctx) => {
    if (data.NODE_ENV !== 'production') return;
    try {
      const host = new URL(data.DATABASE_URL).hostname;
      if (host === 'localhost' || host === '127.0.0.1') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'DATABASE_URL must not point at localhost in production',
          path: ['DATABASE_URL'],
        });
      }
    } catch {
      // already validated
    }
  });

export const forgewindApiEnvSchema = baseEnvSchema
  .merge(databaseEnvSchema)
  .merge(jwtEnvSchema)
  .superRefine((data, ctx) => {
    if (data.NODE_ENV !== 'production') return;
    try {
      const host = new URL(data.DATABASE_URL).hostname;
      if (host === 'localhost' || host === '127.0.0.1') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'DATABASE_URL must not point at localhost in production',
          path: ['DATABASE_URL'],
        });
      }
    } catch {
      // already validated
    }
  });

export const gatewayEnvSchema = baseEnvSchema.merge(jwtEnvSchema.partial());

export const aiEnvSchema = z.object({
  OPENAI_API_KEY: z.string().startsWith('sk-', 'OPENAI_API_KEY must start with sk-'),
  OPENAI_MODEL: z.string().default('gpt-4o'),
  OPENAI_EMBEDDING_MODEL: z.string().default('text-embedding-3-large'),
  PINECONE_API_KEY: z.string().min(1, 'PINECONE_API_KEY is required'),
  PINECONE_INDEX: z.string().min(1, 'PINECONE_INDEX is required'),
});

/**
 * Validates `process.env` against the provided Zod schema.
 * Throws a formatted error listing all validation failures.
 */
export function validateEnv<T extends z.ZodTypeAny>(schema: T): z.infer<T> {
  const result = schema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    throw new Error(
      `Environment validation failed:\n${formatted}\n\nPlease check your .env file or environment variables.`,
    );
  }

  return result.data as z.infer<T>;
}
