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

@Injectable()
export class JobListDataService {
  private rank = LexoRank;
  private logger = new Logger(JobListDataService.name);
  private rebalanceTracker: Record<number, number> = {};
  constructor(
    private prisma: PrismaService,
    private jobJobListRankDB: JobJobListRankDBService,
  ) {}

  async getJobListData(
    jobListParam: JobListDto,
  ): Promise<{ jobListRank: string; jobListId: number }> {
    const { id, beforeJobId, afterJobId } = jobListParam;

    if (id) {
      const jobListRank = await this.genNewBottomRank(id);
      return { jobListRank, jobListId: id };
    } else if (beforeJobId) {
      return this.genNewSiblingRank(beforeJobId, 'before');
    } else if (afterJobId) {
      return this.genNewSiblingRank(afterJobId, 'after');
    }

    throw new BadRequestException(
      `${JobListDto.name} must have only one property defined`,
    );
  }

  private async genNewBottomRank(jobListId: number): Promise<string> {
    const { rank } = this;
    const baseJob = await this.prisma.job.findFirst({
      where: { jobListId: jobListId },
      select: { jobListRank: true },
      orderBy: { jobListRank: 'desc' },
    });

    if (baseJob) {
      const nextRank = rank.parse(baseJob.jobListRank).genNext();
      if (nextRank.isMax() || nextRank.isMin()) {
        await this.rebalanceDB(jobListId);
        return this.genNewBottomRank(jobListId);
      }
      return nextRank.toString();
    }
    const currentBucket = rank.middle().getBucket();
    return rank.initial(currentBucket).toString();
  }

  private async rebalanceDB(jobListId: number) {
    const lastRebalance = this.rebalanceTracker[jobListId];
    if (lastRebalance) {
      const elapsedMinutes = (Date.now() - lastRebalance) / 1000 / 60;
      // arbitrary limit of an 2 hours (lambda functions only run 15 minutes)
      if (elapsedMinutes < 120) {
        const errMsg = `Job list rank rebalance rate exceeded | jobListId: ${jobListId}`;
        this.logger.error(errMsg);
        throw new InternalServerErrorException();
      }
    } else {
      this.rebalanceTracker[jobListId] = Date.now();
    }

    const jobs = await this.prisma.job.findMany({
      where: { id: jobListId },
      select: { id: true, jobListRank: true },
      orderBy: { jobListRank: 'asc' },
    });

    if (jobs?.length > 0) {
      this.logger.verbose(`Rebalancing job list - ${jobListId}`);
      const [firstJob] = jobs;
      const firstJobRank = this.rank.parse(firstJob.jobListRank);
      const newBucket = firstJobRank.inNextBucket().getBucket();

      await this.prisma.$transaction(async (tx) => {
        let latestRank = this.rank.initial(newBucket);

        await Promise.all(
          jobs.map((job) => {
            const jobListRank = latestRank.toString();
            latestRank = latestRank.genNext();
            return tx.job.update({
              where: { id: job.id },
              data: { jobListRank },
            });
          }),
        );
      });
      return;
    }
    this.logger.error(
      `rebalance requested but found no jobs linked to job list (${jobListId})`,
    );
    throw new InternalServerErrorException();
  }

  private async genNewSiblingRank(
    baseJobId: number,
    direction: 'before' | 'after',
  ): Promise<{ jobListRank: string; jobListId: number }> {
    const baseJob = await this.getExistingJob(baseJobId);
    const { jobListId } = baseJob;

    const retry = async () => {
      await this.rebalanceDB(jobListId);
      return this.genNewSiblingRank(baseJobId, direction);
    };

    const siblingRank = await this.getExistingSiblingJobRank(direction, {
      jobListId,
      rank: baseJob.rank,
    });

    if (siblingRank) {
      const jobListRank = this.getRankBetween(siblingRank, baseJob.rank);
      if (jobListRank) return { jobListRank, jobListId };
      return retry();
    }

    const newRank =
      direction === 'after' ? baseJob.rank.genNext() : baseJob.rank.genPrev();
    if (newRank.isMin() || newRank.isMax()) return retry();

    const jobListRank = newRank.toString();
    return { jobListRank, jobListId };
  }

  private async getExistingJob(jobId: number): Promise<{
    jobListId: number;
    rank: LexoRank;
  }> {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      select: { jobListRank: true, jobListId: true },
    });

    if (job) {
      const { jobListId, jobListRank: baseRankStr } = job;
      const rank = this.rank.parse(baseRankStr);
      return { jobListId, rank };
    }
    throw new NotFoundException(`unable to find job ( ${jobId} )`);
  }

  private async getExistingSiblingJobRank(
    direction: 'before' | 'after',
    job: { jobListId: number; rank: LexoRank },
  ): Promise<LexoRank | null> {
    const { jobListId, rank } = job;
    const strRank = rank.toString();

    const siblingJob = await this.prisma.job.findFirst({
      where: {
        jobListId,
        jobListRank: {
          lt: direction === 'before' ? strRank : undefined,
          gt: direction === 'after' ? strRank : undefined,
        },
      },
      select: { jobListRank: true },
      orderBy: { jobListRank: direction === 'before' ? 'desc' : 'asc' },
    });
    return siblingJob ? this.rank.parse(siblingJob.jobListRank) : null;
  }

  private getRankBetween(
    rankLeft: LexoRank,
    rankRight: LexoRank,
  ): string | null {
    const { rank } = this;
    const hasSpaceBetween = rankLeft.compareTo(rankRight) !== 0;
    if (hasSpaceBetween) {
      const bucket = rankRight.getBucket();
      const decimalRank = rank.between(
        rankLeft.getDecimal(),
        rankRight.getDecimal(),
      );
      const newRank = rank.from(bucket, decimalRank);
      return newRank.toString();
    }
    return null;
  }
}
