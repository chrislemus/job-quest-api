import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { validate } from './config.schema';
import { PrismaModule } from './prisma';
import { AppController } from './app.controller';
import { JobModule } from './job/job.module';
import { JobListModule } from './job-list/job-list.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpTransformResponseInterceptor } from './common/interceptors';
import { GlobalExceptionsFilter } from './common/filters';

@Module({
  controllers: [AppController],
  imports: [
    AuthModule,
    ConfigModule.forRoot({ validate }),
    PrismaModule,
    UsersModule,
    JobModule,
    JobListModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: HttpTransformResponseInterceptor },
    { provide: APP_FILTER, useClass: GlobalExceptionsFilter },
  ],
})
export class AppModule {}
