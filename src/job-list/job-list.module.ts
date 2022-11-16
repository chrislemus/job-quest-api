import { Module } from '@nestjs/common';
import { JobListService } from './job-list.service';
import { JobListController } from './job-list.controller';
import { PrismaService } from '@app/prisma';

@Module({
  controllers: [JobListController],
  providers: [JobListService, PrismaService],
})
export class JobListModule {}
