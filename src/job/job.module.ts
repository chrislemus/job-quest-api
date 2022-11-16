import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { PrismaService } from '@app/prisma';

@Module({
  controllers: [JobController],
  providers: [JobService, PrismaService],
})
export class JobModule {}
