import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from './common/prisma.module';
import { GithubController } from './controllers/github.controller';
import { RepositoryController } from './controllers/repository.controller';
import { GithubService } from './services/github.service';
import { RepositoryService } from './services/repository.service';
import { ExternalAccountService } from './services/external-account.service';
import { TokenCipherService } from './services/token-cipher.service';
import { GithubProvider } from './providers/github.provider';
import { EventBusService } from './events/event-bus.service';
import { RepoEventsOrchestrator } from './events/repo-events.orchestrator';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    HttpModule,
    PrismaModule,
  ],
  controllers: [GithubController, RepositoryController],
  providers: [
    GithubService,
    RepositoryService,
    ExternalAccountService,
    TokenCipherService,
    GithubProvider,
    EventBusService,
    RepoEventsOrchestrator,
  ],
})
export class AppModule {}
