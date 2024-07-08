import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from '@app/prisma';
import { JobListDataService } from '@app/job/job-list-data.service';
import { DBModule } from '@app/db/db.module';

@Module({
  imports: [DBModule],
  providers: [UserService, PrismaService, JobListDataService],
  exports: [UserService, JobListDataService],
  controllers: [UserController],
})
export class UserModule {}
