import { Module } from '@nestjs/common';
import { JobListService } from './job-list.service';
import { JobListController } from './job-list.controller';
import { ConfigModule } from '@nestjs/config';
import { JobListDBService } from 'src/db/job-list-db.service';
import { DBModule } from 'src/db/db.module';

@Module({
  imports: [ConfigModule.forRoot(), DBModule],
  controllers: [JobListController],
  providers: [JobListService, JobListDBService],
})
export class JobListModule {}
