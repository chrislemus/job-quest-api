import { Page, pageQuery, PaginatedQuery } from '@app/common/pagination';
import { PrismaService } from '@app/prisma';
import { Injectable } from '@nestjs/common';
import { CreateJobListDto, UpdateJobListDto } from './dto';
import { JobListEntity } from './entities/job-list.entity';

@Injectable()
export class JobListService {
  constructor(private prisma: PrismaService) {}

  /** Create a Job List */
  async create(
    createJobListDto: CreateJobListDto,
    userId: number,
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

  /** Find all Job Lists that belongs to a user */
  async findAll(
    query: PaginatedQuery,
    userId: number,
  ): Promise<Page<JobListEntity>> {
    return pageQuery({
      pageConfig: query,
      queryFn: this.prisma.jobList.findMany,
      queryArgs: { where: { userId } },
      countFn: this.prisma.jobList.count,
    });
  }

  async findOne(id: number, userId: number): Promise<JobListEntity | null> {
    const jobList = await this.prisma.jobList.findUnique({ where: { id: id } });
    if (jobList.userId !== userId) return null;
    return jobList;
  }

  /** Update a Job List */
  async updateJobList(
    jobListId: number,
    jobListDto: UpdateJobListDto,
    userId: number,
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

  /** Remove a Job List */
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
