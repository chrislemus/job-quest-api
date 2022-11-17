import { Page, pageQuery, PaginatedQuery } from '@app/common/pagination';
import { PrismaService } from '@app/prisma';
import { Injectable, Logger } from '@nestjs/common';
import { Job, JobList } from '@prisma/client';
import { CreateJobListDto } from './dto/create-job-list.dto';
import { GetAllJobListsDto } from './dto/get-all-job-list.dto';
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
    let newJobListOrder: undefined | number = createJobListDto?.order;

    if (!newJobListOrder) {
      const lastJobList = await this.prisma.jobList.findFirst({
        orderBy: { order: 'desc' },
        select: { order: true },
      });

      newJobListOrder = lastJobList.order + 1;
    }

    const jobList = await this.prisma.jobList.create({
      data: {
        label: createJobListDto.label,
        userId,
        order: newJobListOrder,
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

  findOne(id: number) {
    return `This action returns a #${id} jobList`;
  }

  update(id: number, updateJobListDto: UpdateJobListDto) {
    return `This action updates a #${id} jobList`;
  }

  remove(id: number) {
    return `This action removes a #${id} jobList`;
  }
}
