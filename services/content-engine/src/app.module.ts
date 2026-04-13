import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GenerationModule } from './modules/generation/generation.module';
import { StrategyModule } from './modules/strategy/strategy.module';
import { TemplatesModule } from './modules/templates/templates.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    GenerationModule,
    StrategyModule,
    TemplatesModule,
  ],
})
export class AppModule {}
