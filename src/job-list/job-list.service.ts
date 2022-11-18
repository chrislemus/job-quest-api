import { Page, pageQuery, PaginatedQuery } from '@app/common/pagination';
import { UpdateJobDto } from '@app/job/dto/update-job.dto';
import { PrismaService } from '@app/prisma';
import { Injectable, Logger } from '@nestjs/common';
import { CreateJobListDto } from './dto/create-job-list.dto';
import { UpdateJobListDto } from './dto/update-job-list.dto';
import { JobListEntity } from './entities/job-list.entity';

@Injectable()
export class JobListService {
  private logger = new Logger(JobListService.name);

  constructor(private prisma: PrismaService) {}

  async create(
    userId: number,
    createJobListDto: CreateJobListDto,
  ): Promise<JobListEntity> {
    const lastJobList = await this.prisma.jobList.findFirst({
      orderBy: { order: 'desc' },
    });

    const nextOrderNumber = lastJobList.order + 1;

    const jobList = await this.prisma.jobList.create({
      data: {
        label: createJobListDto.label,
        order: nextOrderNumber,
        userId,
      },
    });

    return jobList;
  }

  async findAll(
    userId: number,
    query: PaginatedQuery,
  ): Promise<Page<JobListEntity>> {
    return pageQuery({
      pageConfig: query,
      queryFn: this.prisma.jobList.findMany,
      queryArgs: { where: { userId } },
      countFn: this.prisma.jobList.count,
    });
  }

  findOne(id: number): Promise<JobListEntity | null> {
    return this.prisma.jobList.findUnique({ where: { id: id } });
  }

  /**
   * Replace JobList's data
   * @returns updated JobList data
   */
  async updateJobList(
    jobListId: number,
    userId: number,
    jobListDto: UpdateJobListDto,
  ): Promise<JobListEntity> {
    const jobList = await this.prisma.jobList.findUnique({
      where: { id: jobListId },
    });

    if (jobList?.userId !== userId) return null;

    const updatedJobList = await this.prisma.jobList.update({
      where: { id: jobList.id },
      data: { label: jobListDto.label },
    });

    return updatedJobList;
  }

  async remove(jobListId: number, userId: number): Promise<JobListEntity> {
    const jobList = await this.prisma.jobList.findUnique({
      where: { id: jobListId },
      select: { userId: true },
    });

    if (jobList?.userId !== userId) return null;

    const res = await this.prisma.jobList.delete({ where: { id: jobListId } });
    return res;
  }
}
