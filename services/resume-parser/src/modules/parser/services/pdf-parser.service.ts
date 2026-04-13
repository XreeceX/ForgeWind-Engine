import { Injectable, Logger } from '@nestjs/common';
import pdfParse from 'pdf-parse';

@Injectable()
export class PdfParserService {
  private readonly logger = new Logger(PdfParserService.name);

  async extractText(buffer: Buffer): Promise<string> {
    try {
      const result = await pdfParse(buffer);

      if (!result.text.trim()) {
        this.logger.warn('PDF parsed successfully but contained no extractable text');
      }

      return result.text;
    } catch (error) {
      this.logger.error('Failed to parse PDF', error instanceof Error ? error.stack : error);
      throw new Error(
        `PDF parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
