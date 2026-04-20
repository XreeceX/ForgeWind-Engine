import { Global, Module } from '@nestjs/common';
import { createDb } from '../../db';
import { resolveDatabaseUrl } from '../../db/resolve-database-url';
import { DRIZZLE_DB } from './database.constants';

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE_DB,
      useFactory: () => createDb(resolveDatabaseUrl()),
    },
  ],
  exports: [DRIZZLE_DB],
})
export class DatabaseModule {}
