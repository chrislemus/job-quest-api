import { PrismaService } from '@app/prisma';
import { Injectable } from '@nestjs/common';
import { CreateJobLogDto } from './dto/create-job-log.dto';
import { UpdateJobLogDto } from './dto/update-job-log.dto';

@Injectable()
export class JobLogService {
  constructor(private prisma: PrismaService) {}
  create(createJobLogDto: CreateJobLogDto) {
    return 'This action adds a new jobLog';
  }

  findAll() {
    return this.prisma.jobLog.findMany();
    return `This action returns all jobLog`;
  }

  findOne(id: number) {
    return `This action returns a #${id} jobLog`;
  }

  update(id: number, updateJobLogDto: UpdateJobLogDto) {
    return `This action updates a #${id} jobLog`;
  }

  remove(id: number) {
    return `This action removes a #${id} jobLog`;
  }
}
