import { Page, pageQuery } from '@app/common/pagination';
import { PrismaService } from '@app/prisma';
import { Injectable, NotFoundException } from '@nestjs/common';
import { JobLog } from '@prisma/client';
import {
  CreateJobLogDto,
  FindAllJobLogsQueryDto,
  UpdateJobLogDto,
} from './dto';

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

  findAll(
    findAllJobLogsQuery: FindAllJobLogsQueryDto,
    userId: number,
  ): Promise<Page<JobLog>> {
    return pageQuery({
      pageConfig: findAllJobLogsQuery as any,
      queryFn: this.prisma.jobLog.findMany,
      queryArgs: {
        where: {
          job: { userId },
          AND: [
            {
              OR: findAllJobLogsQuery.jobId?.map((id) => ({ jobId: id })),
            },
          ],
        },
      },
      countFn: this.prisma.jobLog.count,
    });
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
