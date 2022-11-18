import { Page, pageQuery, PaginatedQuery } from '@app/common/pagination';
import { PrismaService } from '@app/prisma';
import { Injectable, Logger } from '@nestjs/common';
import { Job, JobList } from '@prisma/client';
import { CreateJobListDto } from './dto/create-job-list.dto';
import { GetAllJobListsDto } from './dto/get-all-job-list.dto';
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

  findOne(id: number): Promise<JobListEntity | null> {
    return this.prisma.jobList.findUnique({ where: { id: id } });
  }

  /**
   * Replace JobList's data
   * @returns updated JobList data
   */
  async replaceJobList(
    jobListId: number,
    userId: number,
    jobListDto: CreateJobListDto,
  ): Promise<JobListEntity> {
    const jobList = await this.prisma.jobList.findFirst({
      where: { id: jobListId, userId: userId },
      select: { id: true, order: true },
    });

    if (jobList === null) return null;
    await this.updateJobListOrder({
      userId,
      jobListId: jobList.id,
      requestedListOrder: jobListDto.order,
    });

    const updatedJobList = await this.prisma.jobList.update({
      where: { id: jobList.id },
      data: { label: jobListDto.label },
    });

    return updatedJobList;
  }

  /**
   *
   * @param config JobList order configuration
   * @returns `null` if no update is required(order number is already assigned to JobList)
   * or a list of updated JobLists if update occurred.
   */
  async updateJobListOrder(config: {
    userId: number;
    jobListId: number;
    requestedListOrder?: number;
  }): Promise<null | { id: number; order: number }[]> {
    const { userId, jobListId } = config;

    // get jobList data
    const jobList = await this.prisma.jobList.findFirst({
      where: { id: jobListId, userId: userId },
      select: { id: true, order: true },
    });

    // store requested list order in mutable variable to update value if its outside boundary
    let { requestedListOrder } = config;

    if (requestedListOrder && jobList.order !== requestedListOrder) {
      const affectedJobLists = await this.prisma.jobList.findMany({
        orderBy: { order: 'asc' }, // ordered list is important
        select: { id: true, order: true },
        where: {
          // conditional logic for retrieving only that job lists that
          // should be updated
          order: {
            gte:
              jobList.order < requestedListOrder
                ? jobList.order
                : requestedListOrder,
            lte:
              jobList.order > requestedListOrder
                ? jobList.order
                : requestedListOrder,
          },
          userId: userId,
        },
      });

      // update requested list order to keep order values within boundaries
      // eg. if requested {order} value is 27 but the current highest order value is 7
      // we will reassigned requested value to 7
      const min = affectedJobLists[0].order;
      const max = affectedJobLists[affectedJobLists.length - 1].order;
      if (requestedListOrder < min) requestedListOrder = min;
      if (requestedListOrder > max) requestedListOrder = max;

      // rearrange all JobLists with corresponding order number
      const updatedList: {
        order: number;
        id: number;
      }[] = affectedJobLists.map((list) => {
        if (list.id === jobList.id) {
          return { ...list, order: requestedListOrder };
        } else {
          const { order } = list;
          return {
            ...list,
            order: requestedListOrder > jobList.order ? order - 1 : order + 1,
          };
        }
      });

      // push update to DB in a transaction to enable rollback incase of failure
      const results = await this.prisma.$transaction(
        updatedList.map((list) => {
          const { id, order } = list;
          return this.prisma.jobList.update({
            where: { id },
            data: { order },
            select: { id: true, order: true },
          });
        }),
      );

      // return updated JobLists
      return results;
    }
    return null;
  }

  remove(id: number) {
    return `This action removes a #${id} jobList`;
  }
}
