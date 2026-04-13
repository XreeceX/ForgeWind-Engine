import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ApplicationsModule } from './modules/applications/applications.module';
import { SchedulingModule } from './modules/scheduling/scheduling.module';
import { OutreachModule } from './modules/outreach/outreach.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ScheduleModule.forRoot(),
    ApplicationsModule,
    SchedulingModule,
    OutreachModule,
  ],
})
export class AppModule {}
