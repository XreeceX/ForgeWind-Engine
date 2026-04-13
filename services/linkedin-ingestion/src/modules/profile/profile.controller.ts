import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfileIngestionService } from './services/profile-ingestion.service';
import { ProfileAnalyzerService } from './services/profile-analyzer.service';
import { IngestTextDto, IngestUrlDto, AnalyzeProfileDto } from '../../common/dto';
import { LinkedInProfile, ProfileAnalysis } from '../../common/interfaces';

@Controller('ingest')
export class ProfileController {
  constructor(
    private readonly ingestionService: ProfileIngestionService,
    private readonly analyzerService: ProfileAnalyzerService,
  ) {}

  @Post('export')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 50 * 1024 * 1024 },
      fileFilter: (_req, file, callback) => {
        if (file.mimetype !== 'application/zip' && !file.originalname.endsWith('.zip')) {
          callback(new BadRequestException('Only .zip files are accepted'), false);
          return;
        }
        callback(null, true);
      },
    }),
  )
  async ingestExport(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body('userId') userId: string,
  ): Promise<LinkedInProfile> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    return this.ingestionService.ingestFromExport(userId, file.buffer);
  }

  @Post('text')
  async ingestText(@Body() dto: IngestTextDto): Promise<LinkedInProfile> {
    return this.ingestionService.ingestFromText(dto.userId, dto.text);
  }

  @Post('url')
  async ingestUrl(@Body() dto: IngestUrlDto): Promise<LinkedInProfile> {
    return this.ingestionService.ingestFromUrl(dto.userId, dto.profileUrl);
  }

  @Post('analyze')
  async analyzeProfile(@Body() dto: AnalyzeProfileDto): Promise<ProfileAnalysis> {
    return this.analyzerService.analyzeByUserId(dto.userId);
  }

  @Get('analysis/:userId')
  getAnalysis(@Param('userId') userId: string): ProfileAnalysis {
    return this.analyzerService.getAnalysis(userId);
  }
}
