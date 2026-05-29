import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { databaseServiceEnvSchema } from '@forgewind-engine/config';
import { bootstrapService } from '@forgewind-engine/utils';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const logger = bootstrapService('integration-service', databaseServiceEnvSchema);
  const app = await NestFactory.create(AppModule, { logger: false });

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: process.env['CORS_ORIGIN'] ?? 'http://localhost:3000',
    credentials: true,
  });

  const port = process.env['PORT'] ?? 4010;
  await app.listen(port);
  logger.info(`Integration service running on port ${port}`);
}

void bootstrap();
