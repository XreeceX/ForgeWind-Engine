import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ParserService } from '../parser/services/parser.service';
import { ExtractionService } from './services/extraction.service';
import { ParseTextDto } from './dto';
import { ParsedResume } from './schemas/parsed-resume.schema';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

@Controller('parse')
export class ExtractionController {
  constructor(
    private readonly parserService: ParserService,
    private readonly extractionService: ExtractionService,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  async parseFile(
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<ApiResponse<ParsedResume>> {
    if (!file) {
      throw new BadRequestException('No file uploaded. Attach a resume as "file" in multipart form data.');
    }

    const rawText = await this.parserService.parse(file);
    const parsed = await this.extractionService.extractFromText(rawText);

    return { success: true, data: parsed };
  }

  @Post('text')
  async parseText(@Body() dto: ParseTextDto): Promise<ApiResponse<ParsedResume>> {
    const parsed = await this.extractionService.extractFromText(dto.text);

    return { success: true, data: parsed };
  }

  @Get('supported-formats')
  getSupportedFormats(): ApiResponse<{ mimeTypes: readonly string[]; extensions: readonly string[] }> {
    return {
      success: true,
      data: this.parserService.getSupportedFormats(),
    };
  }
}
