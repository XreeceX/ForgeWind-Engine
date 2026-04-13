import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from './common/common.module';
import { ProfileModule } from './modules/profile/profile.module';
import { ActivityModule } from './modules/activity/activity.module';
import { NetworkModule } from './modules/network/network.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    CommonModule,
    ProfileModule,
    ActivityModule,
    NetworkModule,
  ],
})
export class AppModule {}
