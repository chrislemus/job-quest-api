import { Module } from '@nestjs/common';
import { JobLogService } from './job-log.service';
import { JobLogController } from './job-log.controller';
import { PrismaModule } from '@app/prisma';

@Module({
  imports: [PrismaModule],
  controllers: [JobLogController],
  providers: [JobLogService],
})
export class JobLogModule {}
