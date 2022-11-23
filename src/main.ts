// import { appSetup } from './main-setup';

// async function bootstrap() {
//   const app = await appSetup();
//   await app.listen(3001);
// }

// bootstrap();
import serverlessExpress from '@vendia/serverless-express';
import { Callback, Context, Handler } from 'aws-lambda';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Page } from './common/pagination/page.dto';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';

let server: Handler;

async function bootstrap(): Promise<Handler> {
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

  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  server = server ?? (await bootstrap());
  return server(event, context, callback);
};
