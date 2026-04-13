import { Global, Module } from '@nestjs/common';
import { OpenAIService } from './services/openai.service';
import { ProfileStoreService } from './services/profile-store.service';

@Global()
@Module({
  providers: [OpenAIService, ProfileStoreService],
  exports: [OpenAIService, ProfileStoreService],
})
export class CommonModule {}
