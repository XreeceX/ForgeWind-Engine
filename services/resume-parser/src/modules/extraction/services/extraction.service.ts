import { Injectable, Logger, UnprocessableEntityException } from '@nestjs/common';
import { OpenAIService } from './openai.service';
import { ParsedResume, ParsedResumeSchema } from '../schemas/parsed-resume.schema';
import { ZodError } from 'zod';

const SYSTEM_PROMPT = `You are an expert resume parser. Your task is to extract structured data from raw resume text.

Return a JSON object with EXACTLY this schema:
{
  "personalInfo": {
    "name": string | null,
    "email": string | null,
    "phone": string | null,
    "location": string | null,
    "linkedinUrl": string | null,
    "githubUrl": string | null,
    "portfolioUrl": string | null
  },
  "experiences": [
    {
      "title": string,
      "company": string,
      "location": string | null,
      "startDate": string | null,
      "endDate": string | null,
      "description": string | null,
      "skills": string[]
    }
  ],
  "education": [
    {
      "institution": string,
      "degree": string | null,
      "field": string | null,
      "startDate": string | null,
      "endDate": string | null
    }
  ],
  "skills": string[],
  "certifications": string[],
  "projects": [
    {
      "name": string,
      "description": string | null,
      "technologies": string[],
      "url": string | null
    }
  ]
}

Rules:
- Extract ALL information available in the resume text
- Use null for fields that are not present in the text
- Normalize dates to "YYYY-MM" format when possible, or keep original text if ambiguous
- For "endDate", use "Present" if the position is current
- Deduplicate skills across experiences and the top-level skills array
- Keep the skills list concise — merge similar items (e.g., "JS" and "JavaScript" → "JavaScript")
- Return valid JSON only, no markdown fences or extra text`;

@Injectable()
export class ExtractionService {
  private readonly logger = new Logger(ExtractionService.name);

  constructor(private readonly openai: OpenAIService) {}

  async extractFromText(rawText: string): Promise<ParsedResume> {
    const trimmed = rawText.trim();

    if (!trimmed) {
      throw new UnprocessableEntityException('Resume text is empty');
    }

    this.logger.log(`Extracting structured data from ${trimmed.length} characters of text`);

    const responseText = await this.openai.complete(SYSTEM_PROMPT, trimmed, {
      temperature: 0.1,
      responseFormat: 'json',
    });

    return this.parseAndValidate(responseText);
  }

  private parseAndValidate(raw: string): ParsedResume {
    let parsed: unknown;

    try {
      parsed = JSON.parse(raw);
    } catch {
      this.logger.error('LLM returned invalid JSON', raw.slice(0, 500));
      throw new UnprocessableEntityException('Failed to parse LLM response as JSON');
    }

    try {
      return ParsedResumeSchema.parse(parsed);
    } catch (error) {
      if (error instanceof ZodError) {
        this.logger.error(
          `LLM response failed schema validation: ${error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')}`,
        );
        throw new UnprocessableEntityException(
          'LLM response did not match the expected resume schema',
        );
      }
      throw error;
    }
  }
}
