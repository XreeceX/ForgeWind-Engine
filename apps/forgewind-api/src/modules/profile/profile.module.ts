import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CareerJobsController, ProfileController } from './profile.controller';
import { ProfileProxyService } from './profile-proxy.service';

@Module({
  imports: [HttpModule],
  controllers: [ProfileController, CareerJobsController],
  providers: [ProfileProxyService],
})
export class ProfileModule {}
