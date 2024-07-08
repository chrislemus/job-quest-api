import { Module } from '@nestjs/common';
import { JobListService } from './job-list.service';
import { JobListController } from './job-list.controller';
import { PrismaService } from '@app/prisma';
import { ConfigModule } from '@nestjs/config';
import { JobListDBService } from '@app/db/job-list-db.service';
import { DBModule } from '@app/db/db.module';

@Module({
  imports: [ConfigModule.forRoot(), DBModule],
  controllers: [JobListController],
  providers: [JobListService, PrismaService, JobListDBService],
})
export class JobListModule {}
