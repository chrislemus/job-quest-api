import { Module } from '@nestjs/common';
import { JobLogService } from './job-log.service';
import { JobLogController } from './job-log.controller';
import { PrismaService } from '@app/prisma';

@Module({
  controllers: [JobLogController],
  providers: [JobLogService, PrismaService],
})
export class JobLogModule {}
