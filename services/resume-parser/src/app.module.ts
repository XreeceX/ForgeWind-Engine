import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ParserModule } from './modules/parser/parser.module';
import { ExtractionModule } from './modules/extraction/extraction.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ParserModule,
    ExtractionModule,
  ],
})
export class AppModule {}
