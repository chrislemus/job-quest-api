import { Module } from '@nestjs/common';
import { JobLogService } from './job-log.service';
import { JobLogController } from './job-log.controller';

@Module({
  controllers: [JobLogController],
  providers: [JobLogService],
})
export class JobLogModule {}
