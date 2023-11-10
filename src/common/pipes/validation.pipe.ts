import { ValidationPipe as _ValidationPipe } from '@nestjs/common';

export class ValidationPipe extends _ValidationPipe {
  constructor() {
    super({
      whitelist: true,
      transform: true,
      transformOptions: {
        // transform payloads based on TS type
        enableImplicitConversion: true,
        exposeUnsetFields: false,
      },
    });
  }
}
