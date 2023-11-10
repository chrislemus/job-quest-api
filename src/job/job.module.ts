import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { PrismaModule } from '@app/prisma';
import { ConfigModule } from '@nestjs/config';
import { JobListDataService } from './job-list-data.service';

@Module({
  imports: [ConfigModule.forRoot(), PrismaModule],
  controllers: [JobController],
  providers: [JobService, JobListDataService],
})
export class JobModule {}
