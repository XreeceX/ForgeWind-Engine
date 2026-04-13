import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EmailParams, EmailResult } from '../../../common/interfaces';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('SMTP_HOST', 'smtp.ethereal.email'),
      port: this.config.get<number>('SMTP_PORT', 587),
      secure: this.config.get<boolean>('SMTP_SECURE', false),
      auth: {
        user: this.config.get<string>('SMTP_USER', ''),
        pass: this.config.get<string>('SMTP_PASS', ''),
      },
    });
  }

  async sendEmail(params: EmailParams): Promise<EmailResult> {
    try {
      const info = await this.transporter.sendMail({
        from: this.config.get<string>(
          'SMTP_FROM',
          'noreply@careeros-forge-engine.app',
        ),
        to: params.to,
        subject: params.subject,
        html: params.body,
        replyTo: params.replyTo ?? undefined,
      });

      this.logger.log(`Email sent to ${params.to}: ${info.messageId}`);

      return {
        success: true,
        messageId: info.messageId as string,
        error: null,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Failed to send email to ${params.to}: ${message}`);

      return {
        success: false,
        messageId: null,
        error: message,
      };
    }
  }

  async sendBulk(emails: EmailParams[]): Promise<EmailResult[]> {
    const results: EmailResult[] = [];

    for (const email of emails) {
      const result = await this.sendEmail(email);
      results.push(result);

      // Rate limiting: wait between sends
      await this.delay(500);
    }

    const successCount = results.filter((r) => r.success).length;
    this.logger.log(
      `Bulk send complete: ${successCount}/${emails.length} succeeded`,
    );

    return results;
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch {
      this.logger.warn('SMTP connection verification failed');
      return false;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
