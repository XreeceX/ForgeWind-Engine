import { Module } from '@nestjs/common';
import { ParserService } from './services/parser.service';
import { PdfParserService } from './services/pdf-parser.service';
import { DocxParserService } from './services/docx-parser.service';

@Module({
  providers: [ParserService, PdfParserService, DocxParserService],
  exports: [ParserService],
})
export class ParserModule {}
