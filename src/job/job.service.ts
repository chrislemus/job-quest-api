import { Page, pageQuery } from '@app/common/pagination';
import { PrismaService } from '@app/prisma';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FindAllJobsQueryDto, JobListOrderDto } from './dto';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobEntity } from './entities/job.entity';
import { LexoRank } from 'lexorank';

@Injectable()
export class JobService {
  private jobOrder = LexoRank;
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async create(createJobDto: CreateJobDto, userId: number): Promise<JobEntity> {
    const createLimit = this.configService.get<number>('JOB_CREATE_LIMIT');
    const userJobCount = await this.prisma.job.count({ where: { userId } });
    if (userJobCount >= createLimit) {
      throw new ConflictException(
        `Exceeded Job limit (${createLimit}). Consider deleting Jobs to free up some space.`,
      );
    }

    const jobList = await this.prisma.jobList.findUnique({
      where: { id: createJobDto.jobListId },
      select: { userId: true },
    });

    if (jobList?.userId !== userId)
      throw new BadRequestException(
        `Cannot find Job List with ID '${createJobDto.jobListId}'`,
      );

    const { jobListOrder: jobListOrderParam, ...jodData } = createJobDto;
    const jobListOrder = await this.getJobListOrder(
      jodData.jobListId,
      jobListOrderParam,
    );

    const job = await this.prisma.job.create({
      data: { ...jodData, userId, jobListOrder },
    });

    return job;
  }

  private async getJobListOrder(
    jobListId: number,
    jobListOrder?: JobListOrderDto,
  ): Promise<string> {
    let jobId: number;
    let order: 'before' | 'after';

    if (jobListOrder?.afterJobId) {
      order = 'after';
      jobId = jobListOrder.afterJobId;
    } else if (jobListOrder?.beforeJobId) {
      order = 'before';
      jobId = jobListOrder.beforeJobId;
    } else {
      const baseJob = await this.prisma.job.findFirst({
        where: { jobListId },
        select: { jobListOrder: true },
        orderBy: { jobListOrder: 'asc' },
      });

      if (baseJob) {
        return this.jobOrder.parse(baseJob.jobListOrder).genNext().toString();
      }
      return this.jobOrder.min().toString();
    }

    const baseJob = await this.prisma.job.findUnique({
      where: { id: jobId },
      select: { jobListOrder: true, jobListId: true },
    });

    if (baseJob?.jobListId !== jobListId) {
      throw new InternalServerErrorException(
        'Unable to create job list order. Job list and Job mismatch',
      );
    }
    const baseJobListOrder = this.jobOrder.parse(baseJob.jobListOrder);

    if (order === 'after') {
      const nextJob = await this.prisma.job.findFirst({
        where: { jobListOrder: { gt: baseJob.jobListOrder } },
        select: { jobListOrder: true },
      });

      const nextJobListOrder: LexoRank | null = nextJob
        ? this.jobOrder.parse(nextJob.jobListOrder)
        : null;

      if (nextJobListOrder) {
        return baseJobListOrder.between(nextJobListOrder).toString();
      } else {
        return baseJobListOrder.genNext().toString();
      }
    } else {
      const prevJob = await this.prisma.job.findFirst({
        where: { jobListOrder: { lt: baseJob.jobListOrder } },
        select: { jobListOrder: true },
      });

      const prevJobListOrder: LexoRank | undefined = prevJob
        ? this.jobOrder.parse(prevJob.jobListOrder)
        : null;

      if (prevJobListOrder) {
        return baseJobListOrder.between(prevJobListOrder).toString();
      } else {
        return baseJobListOrder.genPrev().toString();
      }
    }
  }

  findAll(
    findAllJobsQuery: FindAllJobsQueryDto,
    userId: number,
  ): Promise<Page<JobEntity>> {
    return pageQuery({
      pageConfig: findAllJobsQuery as any,
      queryFn: this.prisma.job.findMany,
      queryArgs: {
        where: {
          userId,
          AND: [
            {
              jobList: {
                OR: findAllJobsQuery.jobListId?.map((id) => ({ id })),
              },
            },
          ],
        },
      },
      countFn: this.prisma.job.count,
    });
  }

  async findOne(jobId: number, userId: number): Promise<JobEntity> {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (job?.userId !== userId) throw new NotFoundException();
    return job;
  }

  async update(
    jobId: number,
    updateJobDto: UpdateJobDto,
    userId: number,
  ): Promise<JobEntity> {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      select: { userId: true },
    });
    if (job?.userId !== userId) throw new NotFoundException();
    const { jobListOrder: jobListOrderParam, ...jodData } = updateJobDto;

    const jobListOrder: string | undefined = jobListOrderParam
      ? await this.getJobListOrder(jodData.jobListId, jobListOrderParam)
      : undefined;

    const updatedJob = await this.prisma.job.update({
      data: { ...jodData, jobListOrder },
      where: { id: jobId },
    });

    return updatedJob;
  }

  async remove(jobId: number, userId: number): Promise<JobEntity> {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      select: { userId: true },
    });
    if (job?.userId !== userId) throw new NotFoundException();

    const deletedJOb = await this.prisma.job.delete({ where: { id: jobId } });
    return deletedJOb;
  }
}
