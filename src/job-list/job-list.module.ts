import { Module } from '@nestjs/common';
import { JobListService } from './job-list.service';
import { JobListController } from './job-list.controller';
import { PrismaModule } from '@app/prisma';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot(), PrismaModule],
  controllers: [JobListController],
  providers: [JobListService],
})
export class JobListModule {}
