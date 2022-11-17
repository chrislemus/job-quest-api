import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { Page } from './common/pagination/page.dto';

async function bootstrap() {
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

  app.enableCors({ origin: '*', methods: '*' });

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

  await app.listen(3001);
}
bootstrap();
