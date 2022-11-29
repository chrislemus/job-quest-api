import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Page } from './common/pagination/page.dto';
import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';

export async function appSetup(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true, // transform payloads based on TS type
      },
    }),
  );

  // apply transform to all responses
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // TODO: specify origin
  app.enableCors({ origin: '*', methods: '*' });

  // Swagger UI setup
  const config = new DocumentBuilder()
    .setTitle('Job Quest API')
    .setDescription('Job Quest API Docs')
    .setVersion('1.0')
    .addBearerAuth()
    .setExternalDoc('JSON Schema', '/api-json')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [Page],
  });

  SwaggerModule.setup('api', app, document);

  return app;
}
