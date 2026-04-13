import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { AiProvider } from './ai-provider';
import { PrismaModule } from './common/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    PrismaModule,
  ],
  controllers: [ContentController],
  providers: [ContentService, AiProvider],
})
export class AppModule {}
