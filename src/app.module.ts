import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { validate } from './config.schema';
import { PrismaModule } from './prisma';
import { AppController } from './app.controller';
import { JobModule } from './job/job.module';
import { JobListModule } from './job-list/job-list.module';

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
})
export class AppModule {}
