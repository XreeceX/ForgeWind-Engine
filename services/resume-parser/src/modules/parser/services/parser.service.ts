import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PdfParserService } from './pdf-parser.service';
import { DocxParserService } from './docx-parser.service';

const SUPPORTED_RESUME_FORMATS = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
] as const;

const SUPPORTED_EXTENSIONS = ['.pdf', '.docx', '.doc', '.txt'] as const;

type SupportedMimeType = (typeof SUPPORTED_RESUME_FORMATS)[number];

@Injectable()
export class ParserService {
  private readonly logger = new Logger(ParserService.name);

  constructor(
    private readonly pdfParser: PdfParserService,
    private readonly docxParser: DocxParserService,
  ) {}

  getSupportedFormats(): { mimeTypes: readonly string[]; extensions: readonly string[] } {
    return {
      mimeTypes: SUPPORTED_RESUME_FORMATS,
      extensions: SUPPORTED_EXTENSIONS,
    };
  }

  async parse(file: Express.Multer.File): Promise<string> {
    const mimeType = file.mimetype as SupportedMimeType;

    if (!this.isSupportedFormat(mimeType)) {
      throw new BadRequestException(
        `Unsupported file type: ${file.mimetype}. Supported formats: ${SUPPORTED_EXTENSIONS.join(', ')}`,
      );
    }

    this.logger.log(`Parsing file: ${file.originalname} (${file.mimetype})`);

    switch (mimeType) {
      case 'application/pdf':
        return this.pdfParser.extractText(file.buffer);

      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      case 'application/msword':
        return this.docxParser.extractText(file.buffer);

      case 'text/plain':
        return file.buffer.toString('utf-8');
    }
  }

  private isSupportedFormat(mimeType: string): mimeType is SupportedMimeType {
    return (SUPPORTED_RESUME_FORMATS as readonly string[]).includes(mimeType);
  }
}
