import { Injectable, Logger } from '@nestjs/common';
import * as mammoth from 'mammoth';

@Injectable()
export class DocxParserService {
  private readonly logger = new Logger(DocxParserService.name);

  async extractText(buffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer });

      if (result.messages.length > 0) {
        this.logger.warn(
          `DOCX extraction warnings: ${result.messages.map((m) => m.message).join('; ')}`,
        );
      }

      return result.value;
    } catch (error) {
      this.logger.error('Failed to parse DOCX', error instanceof Error ? error.stack : error);
      throw new Error(
        `DOCX parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
