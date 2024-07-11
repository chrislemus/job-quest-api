import { JobListDto } from './dto';
import { LexoRank } from 'lexorank';
import { PrismaService } from '@app/prisma';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { JobJobListRankDBService } from '@app/db/job-job-list-rank-db.service';
import { Job, JobDBService } from '@app/db/job-db.service';
import { JobListDBService } from '@app/db/job-list-db.service';

@Injectable()
export class JobListDataService {
  private rank = LexoRank;
  private logger = new Logger(JobListDataService.name);
  private rebalanceTracker: Record<number, number> = {};
  constructor(
    private jobDB: JobDBService,
    private jobListDB: JobListDBService,
  ) {}

  async getJobListData(
    userId: string,
    jobListParam: JobListDto,
  ): Promise<{
    jobRank: string;
    jobListId: string;
    'userId#jobListId': string;
  }> {
    const { id, beforeJobId, afterJobId } = jobListParam;
    if (id) {
      const { Item: jobList } = await this.jobListDB.queryUnique(userId, id);
      if (!jobList) throw new BadRequestException('Job List not found');
      const jobRank = await this.genNewBottomRank(userId, id);
      return this.formatJobListData({ jobRank, jobListId: id, userId });
    } else if (beforeJobId) {
      const data = await this.genNewSiblingRank(userId, beforeJobId, 'before');
      return this.formatJobListData({ ...data, userId });
    } else if (afterJobId) {
      const data = await this.genNewSiblingRank(userId, afterJobId, 'after');
      return this.formatJobListData({ ...data, userId });
    }
    throw new BadRequestException(
      `${JobListDto.name} must have a property defined`,
    );
  }

  formatJobListData(data: {
    jobRank: string;
    jobListId: string;
    userId: string;
  }) {
    return {
      jobRank: data.jobRank,
      jobListId: data.jobListId,
      'userId#jobListId': `${data.userId}#${data.jobListId}`,
    };
  }

  private async genNewBottomRank(
    userId: string,
    jobListId: string,
    shouldRetry = true,
  ): Promise<string> {
    const { rank } = this;

    const res = await this.jobDB.query({
      Limit: 1,
      ScanIndexForward: false,
      IndexName: 'jobListIndex',
      KeyConditionExpression: '#pk = :pkValue',
      ExpressionAttributeNames: { '#pk': 'userId#jobListId' },
      ExpressionAttributeValues: { ':pkValue': `${userId}#${jobListId}` },
    });

    const baseJob = res?.Items?.[0];

    if (baseJob) {
      const nextRank = rank.parse(baseJob.jobRank).genNext();
      if (nextRank.isMax() || nextRank.isMin()) {
        if (!shouldRetry) {
          throw new InternalServerErrorException(
            'Failed to rebalance job list rank',
          );
        }
        await this.rebalanceDB(jobListId, userId);
        return this.genNewBottomRank(userId, jobListId, false);
      }
      return nextRank.toString();
    }
    const currentBucket = rank.middle().getBucket();
    return rank.initial(currentBucket).toString();
  }

  private async rebalanceDB(jobListId: string, userId: string) {
    // throw new InternalServerErrorException('Not implemented yet - rebalanceDB');
    // const lastRebalance = this.rebalanceTracker[jobListId];
    // if (lastRebalance) {
    //   const elapsedMinutes = (Date.now() - lastRebalance) / 1000 / 60;
    //   // arbitrary limit of an 2 hours (lambda functions only run 15 minutes)
    //   if (elapsedMinutes < 120) {
    //     const errMsg = `Job list rank rebalance rate exceeded | jobListId: ${jobListId}`;
    //     this.logger.error(errMsg);
    //     throw new InternalServerErrorException();
    //   }
    // } else {
    //   this.rebalanceTracker[jobListId] = Date.now();
    // }

    // const jobs = await this.prisma.job.findMany({
    //   where: { id: jobListId },
    //   select: { id: true, jobListRank: true },
    //   orderBy: { jobListRank: 'asc' },
    // });
    let ExclusiveStartKey: Record<string, any> | undefined;
    const jobs: Job[] = [];
    let counter = 0;
    do {
      const res = await this.jobDB.query({
        Limit: 1,
        ScanIndexForward: true,
        IndexName: 'jobListIndex',
        KeyConditionExpression: '#k1 = :v1',
        ExpressionAttributeNames: { '#k1': 'userId#jobListId' },
        ExpressionAttributeValues: { ':v1': `${userId}#${jobListId}` },
      });
      console.log(res);
      const jobsData = res?.Items;
      if (jobsData && jobsData?.length > 0) {
        jobs.push(...jobsData);
      }
      ExclusiveStartKey = res.LastEvaluatedKey;
      counter++;
    } while (!!ExclusiveStartKey && counter < 3);
    console.log(jobs);
    // const res2 = await this.jobDB.query({
    //   Limit: 1,

    //   IndexName: 'jobListIndex',
    //   KeyConditionExpression: '#k1 = :v1',
    //   ExpressionAttributeNames: { '#k1': 'userId#jobListId' },
    //   ExpressionAttributeValues: { ':v1': `${userId}#${jobListId}` },
    //   ExclusiveStartKey: res.LastEvaluatedKey,
    // });
    // const jobs = res?.Items;
    // console.log('res', res);
    // console.log('res2', res2);
    throw new Error('Method not implemented.');
    // if (jobs?.length > 0) {
    //   this.logger.verbose(`Rebalancing job list - ${jobListId}`);
    //   const [firstJob] = jobs;
    //   const firstJobRank = this.rank.parse(firstJob.jobListRank);
    //   const newBucket = firstJobRank.inNextBucket().getBucket();
    //   await this.prisma.$transaction(async (tx) => {
    //     let latestRank = this.rank.initial(newBucket);
    //     await Promise.all(
    //       jobs.map((job) => {
    //         const jobListRank = latestRank.toString();
    //         latestRank = latestRank.genNext();
    //         return tx.job.update({
    //           where: { id: job.id },
    //           data: { jobListRank },
    //         });
    //       }),
    //     );
    //   });
    //   return;
    // }
    this.logger.error(
      `rebalance requested but found no jobs linked to job list (${jobListId})`,
    );
    throw new InternalServerErrorException();
  }

  private async genNewSiblingRank(
    userId: string,
    baseJobId: string,
    direction: 'before' | 'after',
    shouldRetry = true,
  ): Promise<{
    jobRank: string;
    jobListId: string;
  }> {
    const baseJob = await this.getExistingJob(userId, baseJobId);
    const { jobListId } = baseJob;

    // avoid infinite loop
    // avoid infinite loop
    // avoid infinite loop
    // avoid infinite loop
    // avoid infinite loop
    // avoid infinite loop
    // avoid infinite loop
    // avoid infinite loop
    // avoid infinite loop
    const retry = async () => {
      if (!shouldRetry) {
        throw new InternalServerErrorException(
          'Failed to generate new sibling rank',
        );
      }
      await this.rebalanceDB(jobListId, userId);
      return this.genNewSiblingRank(userId, baseJobId, direction, false);
    };

    const siblingRank = await this.getExistingSiblingJobRank(
      userId,
      direction,
      { jobListId, rank: baseJob.rank },
    );
    if (siblingRank) {
      const jobRank = this.getRankBetween(siblingRank, baseJob.rank);
      if (jobRank) return { jobRank, jobListId };

      return retry();
    }

    const newRank =
      direction === 'after' ? baseJob.rank.genNext() : baseJob.rank.genPrev();
    if (newRank.isMin() || newRank.isMax()) return retry();

    const jobRank = newRank.toString();
    return { jobRank, jobListId };
  }

  private async getExistingJob(
    userId: string,
    jobId: string,
  ): Promise<{
    jobListId: string;
    rank: LexoRank;
  }> {
    const { Item: job } = await this.jobDB.getUnique(userId, jobId);
    if (job) {
      const { jobRank } = job;
      const [, jobListId] = job['userId#jobListId'].split('#');
      const rank = this.rank.parse(jobRank);
      return { jobListId, rank };
    }
    throw new NotFoundException(`unable to find job ( ${jobId} )`);
  }

  private async getExistingSiblingJobRank(
    userId: string,
    direction: 'before' | 'after',
    job: { jobListId: string; rank: LexoRank },
  ): Promise<LexoRank | null> {
    const dir = direction === 'after' ? '>' : '<';
    const res = await this.jobDB.query({
      Limit: 1,
      IndexName: 'jobListIndex',
      KeyConditionExpression: `#k1 = :v1 AND #k2 ${dir} :v2`,
      ExpressionAttributeNames: { '#k1': 'userId#jobListId', '#k2': 'jobRank' },
      ExpressionAttributeValues: {
        ':v1': `${userId}#${job.jobListId}`,
        ':v2': job.rank.toString(),
      },
    });
    const siblingJob = res?.Items?.[0];
    if (!siblingJob) return null;
    return this.rank.parse(siblingJob.jobRank);
  }

  private getRankBetween(
    rankLeft: LexoRank,
    rankRight: LexoRank,
  ): string | null {
    const hasSpaceBetween = rankLeft.compareTo(rankRight) !== 0;
    if (hasSpaceBetween) {
      const bucket = rankRight.getBucket();
      const decimalRank = this.rank.between(
        rankLeft.getDecimal(),
        rankRight.getDecimal(),
      );
      const newRank = this.rank.from(bucket, decimalRank);
      return newRank.toString();
    }
    return null;
  }
}
