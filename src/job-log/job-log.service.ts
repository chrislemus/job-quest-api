import { PrismaService } from '@app/prisma';
import { Injectable, NotFoundException } from '@nestjs/common';
import { JobLog } from '@prisma/client';
import { CreateJobLogDto, UpdateJobLogDto } from './dto';

@Injectable()
export class JobLogService {
  constructor(private prisma: PrismaService) {}
  async create(createJobLogDto: CreateJobLogDto, userId: number) {
    const job = await this.prisma.job.findUnique({
      where: { id: createJobLogDto.jobId },
      select: { userId: true },
    });

    if (job?.userId !== userId) throw new NotFoundException();

    const jobLog = await this.prisma.jobLog.create({
      data: { jobId: createJobLogDto.jobId, content: createJobLogDto.content },
    });

    return jobLog;
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
