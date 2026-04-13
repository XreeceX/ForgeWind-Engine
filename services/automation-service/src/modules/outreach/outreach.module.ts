import { Module } from '@nestjs/common';
import { EmailService } from './services/email.service';
import { OutreachManagerService } from './services/outreach-manager.service';
import { OutreachController } from './outreach.controller';

@Module({
  controllers: [OutreachController],
  providers: [EmailService, OutreachManagerService],
  exports: [EmailService, OutreachManagerService],
})
export class OutreachModule {}
