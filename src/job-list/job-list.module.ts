import { Module } from '@nestjs/common';
import { JobListService } from './job-list.service';
import { JobListController } from './job-list.controller';

@Module({
  controllers: [JobListController],
  providers: [JobListService]
})
export class JobListModule {}
