import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JobListDataService } from 'src/job/job-list-data.service';
import { DBModule } from 'src/db/db.module';

@Module({
  imports: [DBModule],
  providers: [UserService, JobListDataService],
  exports: [UserService, JobListDataService],
  controllers: [UserController],
})
export class UserModule {}
