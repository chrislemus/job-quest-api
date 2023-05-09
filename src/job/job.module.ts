import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { PrismaService } from '@app/prisma';
import { ConfigModule } from '@nestjs/config';
import { JobListDataService } from './job-list-data.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [JobController],
  providers: [JobService, PrismaService, JobListDataService],
})
export class JobModule {}
