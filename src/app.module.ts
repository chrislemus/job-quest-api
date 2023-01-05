import {
  ClassSerializerInterceptor,
  Module,
  ValidationPipe,
} from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { validate } from './config.schema';
import { PrismaModule } from './prisma';
import { AppController } from './app.controller';
import { JobModule } from './job/job.module';
import { JobListModule } from './job-list/job-list.module';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { HttpTransformResponseInterceptor } from './common/interceptors';
import {
  GlobalExceptionsFilter,
  PrismaClientExceptionFilter,
} from './common/filters';
import { AdminModule } from './admin/admin.module';
import { JobLogModule } from './job-log/job-log.module';

@Module({
  controllers: [AppController],
  imports: [
    AdminModule,
    AuthModule,
    ConfigModule.forRoot({ validate }),
    PrismaModule,
    UserModule,
    JobModule,
    JobListModule,
    JobLogModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: {
          // transform payloads based on TS type
          enableImplicitConversion: true,
        },
      }),
    },
    { provide: APP_INTERCEPTOR, useClass: HttpTransformResponseInterceptor },
    { provide: APP_FILTER, useClass: GlobalExceptionsFilter },
    { provide: APP_FILTER, useClass: PrismaClientExceptionFilter },
  ],
})
export class AppModule {}
