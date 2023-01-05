import { Page, pageQuery } from '@app/common/pagination';
import { PrismaService } from '@app/prisma';
import { Injectable, NotFoundException } from '@nestjs/common';
import { JobLogEntity } from './entities/job-log.entity';
import {
  CreateJobLogDto,
  FindAllJobLogsQueryDto,
  UpdateJobLogDto,
} from './dto';

@Injectable()
export class JobLogService {
  constructor(private prisma: PrismaService) {}

  async create(
    createJobLogDto: CreateJobLogDto,
    userId: number,
  ): Promise<JobLogEntity> {
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
  ): Promise<Page<JobLogEntity>> {
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

  async findOne(jobLogId: number, userId: number): Promise<JobLogEntity> {
    const jobLog = await this.prisma.jobLog.findUnique({
      where: { id: jobLogId },
      include: { job: { select: { userId: true } } },
    });

    if (jobLog?.job?.userId !== userId) throw new NotFoundException();

    if (jobLog.job) jobLog.job = undefined;
    return { ...jobLog };
  }

  async update(
    jobLogId: number,
    updateJobLogDto: UpdateJobLogDto,
    userId: number,
  ): Promise<JobLogEntity> {
    const jobLog = await this.prisma.jobLog.findUnique({
      where: { id: jobLogId },
      include: { job: { select: { userId: true } } },
    });

    if (jobLog?.job?.userId !== userId) throw new NotFoundException();

    const updatedJobLog = await this.prisma.jobLog.update({
      data: { content: updateJobLogDto.content },
      where: { id: jobLogId },
    });

    return updatedJobLog;
  }

  async remove(id: number, userId: number): Promise<JobLogEntity> {
    const jobLog = await this.prisma.jobLog.findUnique({
      where: { id: id },
      include: { job: { select: { userId: true } } },
    });

    if (jobLog?.job?.userId !== userId) throw new NotFoundException();

    const deletedJobLog = await this.prisma.jobLog.delete({
      where: { id: id },
    });

    return deletedJobLog;
  }
}
