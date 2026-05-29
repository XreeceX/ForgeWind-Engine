import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { forgewindApiEnvSchema } from '@forgewind-engine/config';
import { bootstrapService } from '@forgewind-engine/utils';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = bootstrapService('forgewind-api', forgewindApiEnvSchema);
  const app = await NestFactory.create(AppModule, { logger: false });

  app.enableCors({
    origin: (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port, '0.0.0.0');
  logger.info(`ForgeWind API listening on port ${port}`);
}

bootstrap();
