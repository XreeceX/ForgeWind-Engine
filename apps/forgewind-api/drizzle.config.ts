import * as dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';
import { resolveDatabaseUrl } from './src/db/resolve-database-url';

dotenv.config({ path: '../../.env' });
dotenv.config({ path: '.env' });

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: resolveDatabaseUrl(),
  },
});
