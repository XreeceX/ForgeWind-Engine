import { Module } from '@nestjs/common';
import { ApplicationAssistantService } from './services/application-assistant.service';
import { ApplicationsController } from './applications.controller';

@Module({
  controllers: [ApplicationsController],
  providers: [ApplicationAssistantService],
  exports: [ApplicationAssistantService],
})
export class ApplicationsModule {}
