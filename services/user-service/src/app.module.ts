import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { PreferencesModule } from './modules/preferences/preferences.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      envFilePath: ['.env.local', '.env'],
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    PreferencesModule,
  ],
})
export class AppModule {}
