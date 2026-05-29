import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { serviceEnvSchema } from '@forgewind-engine/config';
import { bootstrapService } from '@forgewind-engine/utils';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const logger = bootstrapService('linkedin-ingestion', serviceEnvSchema);
  const app = await NestFactory.create(AppModule, { logger: false });

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.enableCors({
    origin: process.env['CORS_ORIGIN'] ?? 'http://localhost:3000',
    credentials: true,
  });

  const port = process.env['PORT'] ?? 4003;
  await app.listen(port);

  logger.info(`LinkedIn Ingestion service running on port ${port}`);
}

void bootstrap();
