import { Page } from '@app/common/pagination';
import { ConfigService } from '@nestjs/config';
import { FindAllJobsQueryDto } from './dto';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobEntity } from './entities/job.entity';
import { JobListDataService } from './job-list-data.service';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { JobDBService } from '@app/db/job-db.service';
import { JobListDBService } from '@app/db/job-list-db.service';

@Injectable()
export class JobService {
  constructor(
    // private configService: ConfigService,
    private jobListData: JobListDataService,
    private jobDB: JobDBService,
  ) {}

  async create(createJobDto: CreateJobDto, userId: string): Promise<JobEntity> {
    // const createLimit = this.configService.get<number>('JOB_CREATE_LIMIT');
    // const userJobCount = await this.jobDB.totalCount(userId);

    // if (createLimit && userJobCount >= createLimit) {
    //   throw new ConflictException(
    //     `Exceeded Job limit (${createLimit}). Consider deleting Jobs to free up some space.`,
    //   );
    // }
    const { jobListId, jobListRank, ...jobData } = createJobDto;
    const jobListUpdates = await this.jobListData.getJobListData(
      userId,
      jobListId,
      jobListRank,
    );

    const job = await this.jobDB.create({
      ...jobData,
      userId,
      ...jobListUpdates,
    });

    if (!job) throw new InternalServerErrorException();
    return job;
  }

  async findAll(
    findAllJobsQuery: FindAllJobsQueryDto,
    userId: string,
  ): Promise<Page<JobEntity>> {
    const { jobListId } = findAllJobsQuery;

    if (jobListId) throw new Error('Not implemented');
    const queryParams = jobListId
      ? {
          IndexName: 'JobQuest-JobListIndex',
          KeyConditionExpression: 'jobListId = :jobListId',
          ExpressionAttributeValues: { ':jobListId': jobListId },
        }
      : {
          KeyConditionExpression: 'userId = :userId',
          ExpressionAttributeValues: { ':userId': userId },
        };

    const res = await this.jobDB.query({
      // replace Limit with pagination
      // replace Limit with pagination
      // replace Limit with pagination
      // replace Limit with pagination
      // Limit: 1,
      ScanIndexForward: false,
      ...queryParams,
    });

    const data = !res.Items ? [] : res.Items;

    // if (jobListId && data.length > 0) {
    //   data = await this.jobDB
    //     .batchGetItem({
    //       Keys: data.map((job) => ({
    //         userId: job.userId,
    //         id: job.id,
    //       })),
    //     })
    //     .then((res) => res.Items);
    // }

    // if (!res.Items)
    return {
      data,
      pageInfo: {
        currentPage: 0,
        currentPageSize: 0,
        currentPageCount: 0,
      },
    };

    // return pageQuery({
    //   pageConfig: findAllJobsQuery as any,
    //   queryFn: this.prisma.job.findMany,
    //   queryArgs: {
    //     where: {
    //       userId,
    //       AND: [
    //         {
    //           jobList: {
    //             OR: findAllJobsQuery.jobListId?.map((id) => ({ id })),
    //           },
    //         },
    //       ],
    //     },
    //     orderBy: { jobListRank: 'asc' },
    //   },
    //   countFn: this.prisma.job.count,
    // });
  }

  async findOne(jobId: string, userId: string): Promise<JobEntity> {
    const job = await this.jobDB.getUnique(userId, jobId);
    if (!job) throw new NotFoundException();
    return job;
    // return '' as any;
    // const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    // if (job?.userId !== userId) throw new NotFoundException();
    // return job;
  }

  async update(
    jobId: string,
    updateJobDto: UpdateJobDto,
    userId: string,
  ): Promise<JobEntity> {
    const { jobList: _jobList, ...jobData } = updateJobDto;

    const jobListUpdates = _jobList
      ? await this.jobListData.getJobListData(userId, _jobList)
      : {};

    const { Attributes: updatedJob } = await this.jobDB.update({
      id: jobId,
      userId,
      ...jobData,
      ...jobListUpdates,
    });

    if (!updatedJob) throw new NotFoundException();

    return updatedJob;
  }

  async remove(jobId: string, userId: string) {
    const res = await this.jobDB.delete(userId, jobId);
    const statusCode = res.$metadata.httpStatusCode;
    // todo: cleanup jobLogs
    // todo: cleanup jobLogs
    // todo: cleanup jobLogs
    // todo: cleanup jobLogs
    // todo: cleanup jobLogs
    // todo: cleanup jobLogs
    // todo: cleanup jobLogs
    // todo: cleanup jobLogs
    // todo: cleanup jobLogs
    // todo: cleanup jobLogs
    // todo: cleanup jobLogs
    // todo: cleanup jobLogs
    // todo: cleanup jobLogs
    // todo: cleanup jobLogs
    // todo: cleanup jobLogs
    // todo: cleanup jobLogs
    if (!statusCode) throw new InternalServerErrorException();
    if (statusCode === 200) return;
    if (statusCode === 404) throw new NotFoundException();
  }
}
