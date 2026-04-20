import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AgentStateModule } from './modules/agent-state/agent-state.module';
import { DatabaseModule } from './modules/database/database.module';
import { MatchesModule } from './modules/matches/matches.module';
import { NarrativesModule } from './modules/narratives/narratives.module';
import { RepositoriesModule } from './modules/repositories/repositories.module';
import { SnapshotsModule } from './modules/snapshots/snapshots.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    DatabaseModule,
    UsersModule,
    SnapshotsModule,
    RepositoriesModule,
    NarrativesModule,
    MatchesModule,
    AgentStateModule,
  ],
})
export class AppModule {}
