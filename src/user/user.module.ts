import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from '@app/prisma';
import { JobListDataService } from '@app/job/job-list-data.service';

@Module({
  imports: [PrismaModule],
  providers: [UserService, JobListDataService],
  exports: [UserService, JobListDataService],
  controllers: [UserController],
})
export class UserModule {}
