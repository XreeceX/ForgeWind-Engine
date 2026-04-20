import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createDb } from '../../db';
import { DRIZZLE_DB } from './database.constants';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DRIZZLE_DB,
      useFactory: (config: ConfigService) =>
        createDb(config.getOrThrow<string>('DATABASE_URL')),
      inject: [ConfigService],
    },
  ],
  exports: [DRIZZLE_DB],
})
export class DatabaseModule {}
