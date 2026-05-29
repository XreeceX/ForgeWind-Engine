import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { serviceEnvSchema } from '@forgewind-engine/config';
import { bootstrapService } from '@forgewind-engine/utils';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const logger = bootstrapService('recommendation-engine', serviceEnvSchema);
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

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Recommendation Engine')
    .setDescription(
      'AI-powered skill gap analysis, content recommendations, and networking strategy',
    )
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = process.env['PORT'] ?? 4006;
  await app.listen(port);

  logger.info(`Recommendation engine running on port ${port}`);
}

void bootstrap();
