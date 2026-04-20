import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

export * from './schema';

export function createDb(connectionString: string) {
  return drizzle(neon(connectionString), { schema });
}

export type AppDb = ReturnType<typeof createDb>;
