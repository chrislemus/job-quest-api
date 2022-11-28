import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { validate } from './config.schema';
import { PrismaModule } from './prisma';
import { AppController } from './app.controller';
import { JobModule } from './job/job.module';
import { JobListModule } from './job-list/job-list.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpTransformResponseInterceptor } from './common/interceptors';
import {
  GlobalExceptionsFilter,
  PrismaClientExceptionFilter,
} from './common/filters';
import { AdminModule } from './admin/admin.module';

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
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: HttpTransformResponseInterceptor },
    { provide: APP_FILTER, useClass: GlobalExceptionsFilter },
    { provide: APP_FILTER, useClass: PrismaClientExceptionFilter },
  ],
})
export class AppModule {}
