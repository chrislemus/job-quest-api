import { JobListRankDto } from './dto';
import { LexoRank } from 'lexorank';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JobListJobRankDBService } from '@app/db/job-list-job-rank-db.service';

@Injectable()
export class JobListDataService {
  private rank = LexoRank;
  private logger = new Logger(JobListDataService.name);
  constructor(private jobListJobRank: JobListJobRankDBService) {}

  async getJobListData(
    userId: string,
    jobListId: string,
    jobListRankConfig?: JobListRankDto,
  ): Promise<{
    jobListRank: string;
    jobListId: string;
  }> {
    const getData = async () => {
      const config = { jobListId, jobListRankConfig };
      const jobListRanks =
        await this.jobListJobRank.getTopAndBottomJobListRanks(
          jobListId,
          jobListRankConfig,
        );

      const data = await this.getRankPlacement({ ...config, jobListRanks });
      return data;
    };

    let res = await getData();

    if (res === 'rebalance required') {
      await this.rebalanceDB(jobListId, userId);
    }

    res = await getData();

    if (res === 'rebalance required') {
      this.logger.error('Rebalance required after 2nd attempt');

      throw new InternalServerErrorException(
        'failed to rebalance job list ranks',
      );
    }

    return res;
  }

  private async getRankPlacement(config: {
    jobListId: string;
    jobListRankConfig?: JobListRankDto;
    jobListRanks: { topRank?: string; bottomRank?: string };
  }): Promise<
    | {
        jobListRank: string;
        jobListId: string;
      }
    | 'rebalance required'
  > {
    const rebalanceRes = 'rebalance required' as const;
    const { rank } = this;
    const { jobListId, jobListRanks, jobListRankConfig } = config;
    const { topRank: topRankStr, bottomRank: bottomRankStr } = jobListRanks;

    const topRank = topRankStr ? rank.parse(topRankStr) : undefined;
    const bottomRank = bottomRankStr ? rank.parse(bottomRankStr) : undefined;

    // condition must return a value
    if (topRank && bottomRank) {
      const hasSpaceBetween = topRank.compareTo(bottomRank) !== 0;
      if (!hasSpaceBetween) return rebalanceRes;

      const bucket = topRank.getBucket();
      const [tRank, bRank] = [topRank, bottomRank].map((r) => r.getDecimal());
      const decimalRank = rank.between(tRank, bRank);
      const newRank = rank.from(bucket, decimalRank).toString();
      return { jobListRank: newRank, jobListId };
    }

    // condition must return a value
    if (topRank || bottomRank) {
      const baseRank = (topRank || bottomRank) as LexoRank;
      const rankBottom = jobListRankConfig?.placement === 'bottom';
      const newRank = rankBottom ? baseRank.genNext() : baseRank.genPrev();

      const limitReached = newRank.isMax() || newRank.isMin();
      if (limitReached) return rebalanceRes;
      return { jobListId, jobListRank: newRank.toString() };
    }

    const currentBucket = rank.middle().getBucket();
    const jobListRank = rank.initial(currentBucket).toString();
    return { jobListRank, jobListId };
  }

  // private async getRankPlacement(config: {
  //   jobListId: string;
  //   jobListRankConfig?: JobListRankDto;
  //   jobListRanks?:
  //     | { topRank: string; bottomRank: undefined }
  //     | { bottomRank: string; topRank: undefined };
  // }): Promise<{ jobListRank: string; jobListId: string }> {
  //   const { jobListId, jobListRanks, jobListRankConfig } = config;
  //   const { rank } = this;

  //   const baseRankStr = jobListRanks?.topRank || jobListRanks?.bottomRank;

  //   if (!baseRankStr) {
  //     const currentBucket = rank.middle().getBucket();
  //     const jobListRank = rank.initial(currentBucket).toString();
  //     return { jobListRank, jobListId };
  //   }

  //   const baseRank = rank.parse(baseRankStr);
  //   const genNext = jobListRankConfig?.placement === 'bottom';
  //   const newRank = genNext ? baseRank.genNext() : baseRank.genPrev();

  //   const limitReached = newRank.isMax() || newRank.isMin();
  //   if (limitReached) throw new InternalServerErrorException(rebalanceErrorMsg);

  //   return { jobListId, jobListRank: newRank.toString() };
  // }

  //   userId: string,
  // jobListId: string,
  // shouldRetry = true,
  // topRank?: string,
  // private async getRankBetween(config: {
  //   jobListId: string;
  //   jobListRankConfig?: JobListRankDto;
  //   jobListRanks: { topRank: string; bottomRank: string };
  // }): Promise<{
  //   jobListRank: string;
  //   jobListId: string;
  // }> {
  //   const { jobListId, jobListRanks } = config;
  //   const topRank = this.rank.parse(jobListRanks.topRank);
  //   const bottomRank = this.rank.parse(jobListRanks.bottomRank);

  //   const hasSpaceBetween = topRank.compareTo(bottomRank) !== 0;
  //   if (hasSpaceBetween) {
  //     const bucket = topRank.getBucket();
  //     const decimalRank = this.rank.between(
  //       topRank.getDecimal(),
  //       bottomRank.getDecimal(),
  //     );
  //     const newRank = this.rank.from(bucket, decimalRank).toString();
  //     return { jobListRank: newRank, jobListId };
  //   }

  //   throw new InternalServerErrorException(rebalanceErrorMsg);
  // }

  private async rebalanceDB(jobListId: string, userId: string) {
    // add TimeToExist for retries
    // add TimeToExist for retries
    // add TimeToExist for retries
    // add TimeToExist for retries
    // add TimeToExist for retries
    // add TimeToExist for retries
    // add TimeToExist for retries
    // add TimeToExist for retries
    // add TimeToExist for retries
    // add TimeToExist for retries
    // add TimeToExist for retries
    // const logRebalanceStatus = (s: 'init' | 'success' | 'failed') => {
    //   const msg = `Rebalancing job list ranks: status=${s} |  userId=${userId} | jobListId=${jobListId}`;
    //   this.logger.warn(msg);
    // };
    // logRebalanceStatus('init');
    // logRebalanceStatus('success');
    // logRebalanceStatus('failed');
    throw new InternalServerErrorException('Method not implemented.');
    // let ExclusiveStartKey: Record<string, any> | undefined;
    // const jobs: Job[] = [];
    // let counter = 0;
    // do {
    //   const res = await this.jobDB.query({
    //     Limit: 3,
    //     ScanIndexForward: true,
    //     ExclusiveStartKey,
    //     IndexName: 'JobQuest-JobListIndex',
    //     KeyConditionExpression: 'jobListId = :jobListId',
    //     ExpressionAttributeValues: { ':jobListId': jobListId },
    //   });
    //   const jobsData = res?.Items;
    //   if (jobsData && jobsData?.length > 0) {
    //     jobs.push(...jobsData);
    //   }
    //   ExclusiveStartKey = res.LastEvaluatedKey;
    //   counter++;
    // } while (!!ExclusiveStartKey && counter < 6);

    // if (jobs?.length > 0) {
    //   this.logger.verbose(`Rebalancing job list - ${jobListId}`);
    //   const [firstJob] = jobs;
    //   const firstJobRank = this.rank.parse(firstJob.jobListRank);
    //   const newBucket = firstJobRank.inNextBucket().getBucket();
    //   let latestRank = this.rank.initial(newBucket);
    //   await Promise.all(
    //     jobs.map((job) => {
    //       const { id } = job;
    //       const jobListRank = latestRank.toString();
    //       latestRank = latestRank.genNext();
    //       return this.jobDB.update({ id, userId, jobListRank });
    //     }),
    //   );
    //   this.logger.verbose(`Rebalancing job list success - ${jobListId}`);
    //   return;
    // }
    // this.logger.error(
    //   `rebalance requested but found no jobs linked to job list (${jobListId})`,
    // );
    // throw new InternalServerErrorException();
  }

  // private async genNewSiblingRank(
  //   userId: string,
  //   baseJobId: string,
  //   direction: 'before' | 'after',
  //   shouldRetry = true,
  // ): Promise<{
  //   jobListRank: string;
  //   jobListId: string;
  // }> {
  //   const baseJob = await this.getExistingJob(userId, baseJobId);
  //   const { jobListId } = baseJob;

  //   // avoid infinite loop
  //   // avoid infinite loop
  //   // avoid infinite loop
  //   // avoid infinite loop
  //   // avoid infinite loop
  //   // avoid infinite loop
  //   // avoid infinite loop
  //   // avoid infinite loop
  //   // avoid infinite loop
  //   const retry = async () => {
  //     if (!shouldRetry) {
  //       throw new InternalServerErrorException(
  //         'Failed to generate new sibling rank',
  //       );
  //     }
  //     await this.rebalanceDB(jobListId, userId);
  //     return this.genNewSiblingRank(userId, baseJobId, direction, false);
  //   };

  //   // const siblingRank = await this.getExistingSiblingJobRank(
  //   //   userId,
  //   //   direction,
  //   //   { jobListId, rank: baseJob.jobListRank },
  //   // );
  //   const siblingRank = await this.getExistingSiblingJobRank(
  //     userId,
  //     direction,
  //     { jobListId, rank: baseJob.jobListRank },
  //   );
  //   if (siblingRank) {
  //     const jobListRank = this.getRankBetween(siblingRank, baseJob.jobListRank);
  //     if (jobListRank) return { jobListRank, jobListId };

  //     return retry();
  //   }

  //   const newRank =
  //     direction === 'after'
  //       ? baseJob.jobListRank.genNext()
  //       : baseJob.jobListRank.genPrev();
  //   if (newRank.isMin() || newRank.isMax()) return retry();

  //   const jobListRank = newRank.toString();
  //   return { jobListRank, jobListId };
  // }

  // private async getExistingJob(
  //   userId: string,
  //   jobId: string,
  // ): Promise<{
  //   jobListId: string;
  //   jobListRank: LexoRank;
  // }> {
  //   const { Item: job } = await this.jobDB.getUnique(userId, jobId, [
  //     'jobListId',
  //     'jobListRank',
  //   ]);
  //   if (job) {
  //     const { jobListId } = job;
  //     const jobListRank = this.rank.parse(job.jobListRank);
  //     return { jobListId, jobListRank };
  //   }
  //   throw new NotFoundException(`unable to find job ( ${jobId} )`);
  // }

  // private async getExistingSiblingJobRank(
  //   userId: string,
  //   direction: 'before' | 'after',
  //   job: { jobListId: string; rank: LexoRank },
  // ): Promise<LexoRank | null> {
  //   const dir = direction === 'after' ? '>' : '<';
  //   const res = await this.jobDB.query({
  //     Limit: 1,
  //     IndexName: 'JobQuest-JobListIndex',
  //     KeyConditionExpression: `jobListId = :jobListId AND jobListRank ${dir} :jobListRank`,
  //     ExpressionAttributeValues: {
  //       ':jobListId': job.jobListId,
  //       ':jobListRank': job.rank.toString(),
  //     },
  //   });
  //   const siblingJob = res?.Items?.[0];
  //   if (!siblingJob) return null;
  //   return this.rank.parse(siblingJob.jobListRank);
  // }

  // private getRankBetween(
  //   rankLeft: LexoRank,
  //   rankRight: LexoRank,
  // ): string | null {
  //   const hasSpaceBetween = rankLeft.compareTo(rankRight) !== 0;
  //   if (hasSpaceBetween) {
  //     const bucket = rankRight.getBucket();
  //     const decimalRank = this.rank.between(
  //       rankLeft.getDecimal(),
  //       rankRight.getDecimal(),
  //     );
  //     const newRank = this.rank.from(bucket, decimalRank);
  //     return newRank.toString();
  //   }
  //   return null;
  // }
}
