import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SkillsModule } from './modules/skills/skills.module';
import { ContentRecommendationModule } from './modules/content/content-recommendation.module';
import { NetworkingModule } from './modules/networking/networking.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    SkillsModule,
    ContentRecommendationModule,
    NetworkingModule,
  ],
})
export class AppModule {}
