import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ProfileController } from './profile.controller';
import { LinkedInDataParserService } from './services/linkedin-data-parser.service';
import { ProfileIngestionService } from './services/profile-ingestion.service';
import { ProfileAnalyzerService } from './services/profile-analyzer.service';

@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
    }),
  ],
  controllers: [ProfileController],
  providers: [
    LinkedInDataParserService,
    ProfileIngestionService,
    ProfileAnalyzerService,
  ],
  exports: [
    LinkedInDataParserService,
    ProfileIngestionService,
    ProfileAnalyzerService,
  ],
})
export class ProfileModule {}
