import { Page, pageQuery, PaginatedQuery } from '@app/common/pagination';
import { PrismaService } from '@app/prisma';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateJobListDto, UpdateJobListDto } from './dto';
import { JobListEntity } from './entities/job-list.entity';

@Injectable()
export class JobListService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  /** Create a Job List */
  async create(
    createJobListDto: CreateJobListDto,
    userId: number,
  ): Promise<JobListEntity> {
    const createLimit = this.configService.get<number>('JOB_LIST_CREATE_LIMIT');
    const userJobListCount = await this.prisma.jobList.count({
      where: { userId },
    });
    if (userJobListCount >= createLimit) {
      throw new ConflictException(
        `Exceeded Job List limit (${createLimit}). Consider deleting Job Lists to free up some space.`,
      );
    }

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

  async findOne(id: number, userId: number): Promise<JobListEntity> {
    const jobList = await this.prisma.jobList.findUnique({ where: { id: id } });
    if (jobList.userId !== userId) throw new NotFoundException();
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

    if (jobList?.userId !== userId) throw new NotFoundException();

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

    if (jobList?.userId !== userId) throw new NotFoundException();

    const res = await this.prisma.jobList.delete({ where: { id: jobListId } });
    return res;
  }
}
