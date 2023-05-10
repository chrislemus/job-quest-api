import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from '@app/prisma';
import { JobListDataService } from '@app/job/job-list-data.service';

@Module({
  providers: [UserService, PrismaService, JobListDataService],
  exports: [UserService, JobListDataService],
  controllers: [UserController],
})
export class UserModule {}
