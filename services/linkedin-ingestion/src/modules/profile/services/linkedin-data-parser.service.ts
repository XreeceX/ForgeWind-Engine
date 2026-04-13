import { Injectable, Logger } from '@nestjs/common';
import AdmZip from 'adm-zip';
import csvParser from 'csv-parser';
import { Readable } from 'stream';
import { OpenAIService } from '../../../common/services/openai.service';
import {
  LinkedInConnection,
  LinkedInEducation,
  LinkedInEndorsement,
  LinkedInExportData,
  LinkedInMessage,
  LinkedInPosition,
  LinkedInProfile,
  LinkedInProfileBasic,
  LinkedInSkill,
} from '../../../common/interfaces';

interface CsvRow {
  [key: string]: string;
}

@Injectable()
export class LinkedInDataParserService {
  private readonly logger = new Logger(LinkedInDataParserService.name);

  constructor(private readonly openAIService: OpenAIService) {}

  async parseExportZip(buffer: Buffer): Promise<LinkedInExportData> {
    const zip = new AdmZip(buffer);
    const entries = zip.getEntries();

    const csvFiles = new Map<string, string>();
    for (const entry of entries) {
      if (entry.entryName.endsWith('.csv') && !entry.isDirectory) {
        const fileName = entry.entryName.split('/').pop() ?? entry.entryName;
        csvFiles.set(fileName, entry.getData().toString('utf-8'));
      }
    }

    this.logger.log(`Found ${csvFiles.size} CSV files in export: ${[...csvFiles.keys()].join(', ')}`);

    const [profile, positions, education, skills, endorsements, connections, messages] =
      await Promise.all([
        this.parseProfileCsv(csvFiles.get('Profile.csv') ?? ''),
        this.parsePositionsCsv(csvFiles.get('Positions.csv') ?? ''),
        this.parseEducationCsv(csvFiles.get('Education.csv') ?? ''),
        this.parseSkillsCsv(csvFiles.get('Skills.csv') ?? ''),
        this.parseEndorsementsCsv(csvFiles.get('Endorsement_Received.csv') ?? ''),
        this.parseConnectionsCsv(csvFiles.get('Connections.csv') ?? ''),
        this.parseMessagesCsv(csvFiles.get('Messages.csv') ?? ''),
      ]);

    return { profile, positions, education, skills, endorsements, connections, messages };
  }

  async parseRawProfile(text: string): Promise<Partial<LinkedInProfile>> {
    const systemPrompt = `You are an expert at parsing LinkedIn profile information from unstructured text.
Extract all available profile data and return it as a JSON object with the following structure:
{
  "firstName": string,
  "lastName": string,
  "headline": string,
  "summary": string,
  "emailAddress": string,
  "location": string,
  "industry": string,
  "profileUrl": string,
  "positions": [{ "title": string, "company": string, "location": string, "startDate": string, "endDate": string | null, "description": string }],
  "education": [{ "school": string, "degree": string, "fieldOfStudy": string, "startDate": string, "endDate": string, "activities": string, "description": string }],
  "skills": [{ "name": string }]
}
Only include fields that you can confidently extract from the text. Leave unknown fields as empty strings.
Return valid JSON only.`;

    const result = await this.openAIService.jsonCompletion<Partial<LinkedInProfile>>(
      systemPrompt,
      text,
    );

    this.logger.log(`Parsed raw profile text, extracted ${Object.keys(result).length} fields`);
    return result;
  }

  private async parseCsv<T extends CsvRow>(csvContent: string): Promise<T[]> {
    if (!csvContent.trim()) {
      return [];
    }

    return new Promise((resolve, reject) => {
      const results: T[] = [];
      const stream = Readable.from([csvContent]);

      stream
        .pipe(csvParser())
        .on('data', (row: T) => results.push(row))
        .on('end', () => resolve(results))
        .on('error', (error: Error) => reject(error));
    });
  }

  private async parseProfileCsv(content: string): Promise<LinkedInProfileBasic> {
    const rows = await this.parseCsv(content);
    const row = rows[0] ?? {};

    return {
      firstName: this.getField(row, 'First Name'),
      lastName: this.getField(row, 'Last Name'),
      headline: this.getField(row, 'Headline'),
      summary: this.getField(row, 'Summary'),
      emailAddress: this.getField(row, 'Email Address'),
      location: this.getField(row, 'Location'),
      industry: this.getField(row, 'Industry'),
      profileUrl: this.getField(row, 'Profile URL', 'Public Profile URL'),
    };
  }

  private async parsePositionsCsv(content: string): Promise<LinkedInPosition[]> {
    const rows = await this.parseCsv(content);

    return rows.map((row) => ({
      title: this.getField(row, 'Title'),
      company: this.getField(row, 'Company Name'),
      location: this.getField(row, 'Location'),
      startDate: this.buildDate(this.getField(row, 'Started On')),
      endDate: this.getField(row, 'Finished On')
        ? this.buildDate(this.getField(row, 'Finished On'))
        : null,
      description: this.getField(row, 'Description'),
    }));
  }

  private async parseEducationCsv(content: string): Promise<LinkedInEducation[]> {
    const rows = await this.parseCsv(content);

    return rows.map((row) => ({
      school: this.getField(row, 'School Name'),
      degree: this.getField(row, 'Degree Name'),
      fieldOfStudy: this.getField(row, 'Field Of Study', 'Fields of Study'),
      startDate: this.getField(row, 'Start Date'),
      endDate: this.getField(row, 'End Date'),
      activities: this.getField(row, 'Activities'),
      description: this.getField(row, 'Notes', 'Description'),
    }));
  }

  private async parseSkillsCsv(content: string): Promise<LinkedInSkill[]> {
    const rows = await this.parseCsv(content);

    return rows.map((row) => ({
      name: this.getField(row, 'Name', 'Skill'),
    }));
  }

  private async parseEndorsementsCsv(content: string): Promise<LinkedInEndorsement[]> {
    const rows = await this.parseCsv(content);

    return rows.map((row) => ({
      skillName: this.getField(row, 'Skill Name'),
      endorserName: this.getField(row, 'Endorser Name', 'Endorser'),
      endorsementDate: this.getField(row, 'Endorsement Date', 'Date'),
    }));
  }

  private async parseConnectionsCsv(content: string): Promise<LinkedInConnection[]> {
    const rows = await this.parseCsv(content);

    return rows.map((row) => ({
      firstName: this.getField(row, 'First Name'),
      lastName: this.getField(row, 'Last Name'),
      emailAddress: this.getField(row, 'Email Address'),
      company: this.getField(row, 'Company'),
      position: this.getField(row, 'Position'),
      connectedOn: this.getField(row, 'Connected On'),
    }));
  }

  private async parseMessagesCsv(content: string): Promise<LinkedInMessage[]> {
    const rows = await this.parseCsv(content);

    return rows.map((row) => ({
      conversationId: this.getField(row, 'CONVERSATION ID', 'Conversation ID'),
      from: this.getField(row, 'FROM', 'From'),
      to: this.getField(row, 'TO', 'To'),
      date: this.getField(row, 'DATE', 'Date'),
      subject: this.getField(row, 'SUBJECT', 'Subject'),
      content: this.getField(row, 'CONTENT', 'Content'),
    }));
  }

  private getField(row: CsvRow, ...keys: string[]): string {
    for (const key of keys) {
      if (row[key] !== undefined && row[key] !== '') {
        return row[key];
      }
    }
    return '';
  }

  private buildDate(raw: string): string {
    if (!raw) return '';
    const trimmed = raw.trim();
    // LinkedIn exports dates in various formats: "Jan 2020", "2020", "01/2020"
    return trimmed;
  }
}
