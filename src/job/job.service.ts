import { Page, pageQuery } from '@app/common/pagination';
import { PrismaService } from '@app/prisma';
import { ConfigService } from '@nestjs/config';
import { FindAllJobsQueryDto } from './dto';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobEntity } from './entities/job.entity';
import { JobListDataService } from './job-list-data.service';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { JobDBService, Job as RawDBJob } from '@app/db/job-db.service';
import { JobListDBService } from '@app/db/job-list-db.service';

// import { JobJobListRankDBService } from '@app/db/job-job-list-rank-db.service';
function fmtJob(job: RawDBJob) {
  const { 'userId#jobListId': jobListIdRaw, jobRank, ...jobData } = job;
  const [, jobListId] = jobListIdRaw.split('#');
  return { ...jobData, jobListId, jobListRank: jobRank };
}
@Injectable()
export class JobService {
  constructor(
    private configService: ConfigService,
    private jobListData: JobListDataService,
    private jobDB: JobDBService,
    private jobListDB: JobListDBService, // private jobJobListRankDB: JobJobListRankDBService,
  ) {}

  async create(createJobDto: CreateJobDto, userId: string): Promise<JobEntity> {
    const createLimit = this.configService.get<number>('JOB_CREATE_LIMIT');
    // const userJobCount = await this.prisma.job.count({ where: { userId } });
    const userJobCount = await this.jobDB.totalCount(userId);

    if (createLimit && userJobCount >= createLimit) {
      throw new ConflictException(
        `Exceeded Job limit (${createLimit}). Consider deleting Jobs to free up some space.`,
      );
    }
    const { jobList: _jobList, ...jobData } = createJobDto;
    // const jobList = await this.jobListData.getJobListData(_jobList);

    // const jobJobListRank = await this.jobJobListRankDB.query({
    //   // Select: 'COUNT',
    //   Limit: 1,
    //   FilterExpression: 'jobListId = :jobListId',
    //   ExpressionAttributeValues: {
    //     ':userId#jobListId': `${userId}#${jobList.id}`,
    //   },
    // });

    const jobListUpdates = await this.jobListData.getJobListData(
      userId,
      _jobList,
    );
    // console.log('create jobList data', jobListUpdates);
    const res = await this.jobDB.create({
      ...jobData,
      userId,
      ...jobListUpdates,
    });

    if (!res.Item) throw new InternalServerErrorException();
    const { 'userId#jobListId': jobListIdRaw, jobRank, ...job } = res.Item;
    const jobListId = jobListIdRaw.split('#')[1];
    return { ...job, jobListId, jobListRank: jobRank };
    // await this.prisma.jobList
    //   .findUnique({
    //     where: { id: jobList.jobListId },
    //     select: { userId: true },
    //   })
    //   .then((data) => {
    //     const errMsg = `Cannot find Job List with ID '${jobList.jobListId}'`;
    //     if (data?.userId !== userId) throw new BadRequestException(errMsg);
    //   });

    // const job = await this.prisma.job.create({
    //   data: { ...jobData, ...jobList, userId },
    // });

    // return job;
  }

  async findAll(
    findAllJobsQuery: FindAllJobsQueryDto,
    userId: string,
  ): Promise<Page<JobEntity>> {
    const { jobListId } = findAllJobsQuery;
    // let KeyConditionExpression = 'userId = :userId';
    // if (jobListId) {
    //   KeyConditionExpression += ' AND jobListId IN (:jobListId)';
    // }
    // console.log(jobListId, 'jobListId');
    // IndexName: 'jobListIndex',
    // KeyConditionExpression: 'userId#jobListId = :userId#jobListId',
    // ExpressionAttributeValues: {
    //   ':userId#jobListId': `${userId}#${jobListId}`,
    // },

    // console.log(findAllJobsQuery, 'findAllJobsQuery');

    const queryParams = jobListId
      ? {
          IndexName: 'jobListIndex',
          ExpressionAttributeNames: { '#pk': 'userId#jobListId' },
          KeyConditionExpression: '#pk = :pkVal',
          ExpressionAttributeValues: { ':pkVal': `${userId}#${jobListId}` },
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

    let data = !res.Items ? [] : res.Items.map((job) => fmtJob(job));

    if (jobListId && data.length > 0) {
      data = await this.jobDB
        .batchGetItem({
          Keys: data.map((job) => ({
            userId: job.userId,
            id: job.id,
          })),
        })
        .then((res) => {
          return res.Items.map((job) => fmtJob(job));
        });
    }

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
    const { Item: jobRaw } = await this.jobDB.getUnique(userId, jobId);
    if (!jobRaw) throw new NotFoundException();
    return fmtJob(jobRaw);
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
    // return '' as any;
    // const job = await this.prisma.job.findUnique({
    //   where: { id: jobId },
    //   select: { userId: true },
    // });
    // if (job?.userId !== userId) throw new NotFoundException();
    const { jobList: _jobList, ...jobData } = updateJobDto;
    // const jobList = await this.jobListData.getJobListData(_jobList);

    // const
    // if (!_jobList?.id) throw new BadRequestException('Not Implemented yet');
    // implement above
    // implement above
    // implement above
    // implement above
    // implement above
    // implement above
    // implement above
    // implement above
    // const { Item: jobList } = _jobList
    //   ? await this.jobListDB.queryUnique(userId, _jobList.id)
    //   : { Item: undefined };

    // if (_jobList && !jobList)
    //   throw new BadRequestException('Job List not found');

    // //  const nextRank = await this.jobListData.getJobListData(userId, _jobList);
    // const jobListUpdates = jobList
    //   ? await this.jobListData.getJobListData(userId, jobList).then((res) => {
    //       return {
    //         jobRank: res.jobListRank,
    //         'userId#jobListId': `${userId}#${res.jobListId}`,
    //       };
    //     })
    //   : {};
    // console.log('_jobList', _jobList);
    const jobListUpdates = _jobList
      ? await this.jobListData.getJobListData(userId, _jobList)
      : {};
    console.log('\n\njobListUpdates', jobListUpdates);

    const { Attributes: updatedJob } = await this.jobDB.update({
      id: jobId,
      userId,
      ...jobData,
      ...jobListUpdates,
    });

    if (!updatedJob) throw new NotFoundException();
    // console.log(
    //   'updated job - jobList',
    //   updatedJob['userId#jobListId'].split('#')[1],
    // );
    return fmtJob(updatedJob);
    // jobList.
    // let jobList:
    //   | undefined
    //   | {
    //       jobListRank: string;
    //       jobListId: number;
    //     };
    // if (_jobList) {
    //   jobList = await this.jobListData.getJobListData(_jobList);
    // }

    // const updatedJob = await this.prisma.job.update({
    //   data: { ...jobData, ...jobList },
    //   where: { id: jobId },
    // });

    // return updatedJob;
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
