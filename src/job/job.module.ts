import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { ConfigModule } from '@nestjs/config';
import { JobListDataService } from './job-list-data.service';
import { DBModule } from 'src/db/db.module';

@Module({
  imports: [ConfigModule.forRoot(), DBModule, DBModule],
  controllers: [JobController],
  providers: [JobService, JobListDataService],
})
export class JobModule {}
