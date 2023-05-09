import { JobListParamDto } from './dto';
import { LexoRank } from 'lexorank';
import { PrismaService } from '@app/prisma';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class JobListDataService {
  private rank = LexoRank;
  private logger = new Logger(JobListDataService.name);
  private rebalanceTracker: Record<number, number> = {};

  constructor(private prisma: PrismaService) {}

  private async rebalanceDB(jobListId: number) {
    const lastRebalance = this.rebalanceTracker[jobListId];
    if (lastRebalance) {
      const elapsedMinutes = (Date.now() - lastRebalance) / 1000 / 60;
      if (elapsedMinutes < 30) {
        const errMsg = `Failed to rebalance jobListRanks | jobListId: ${jobListId}`;
        this.logger.error(errMsg);
        throw new InternalServerErrorException(errMsg);
      }
    }
    const jobs = await this.prisma.job.findMany({
      where: { id: jobListId },
      select: { id: true, jobListRank: true },
      orderBy: { jobListRank: 'desc' },
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
            latestRank = latestRank.genNext();
            const jobListRank = latestRank.toString();

            return tx.job.update({
              where: { id: job.id },
              data: { jobListRank },
            });
          }),
        );
      });
    }
    this.logger.error(
      `rebalance requested but found no jobs linked to job list (${jobListId})`,
    );
    throw new InternalServerErrorException('Job rank rebalance failed');
  }

  private async genNextRank(jobListId: number): Promise<string> {
    const { rank } = this;
    const baseJob = await this.prisma.job.findFirst({
      where: { id: jobListId },
      select: { jobListRank: true },
      orderBy: { jobListRank: 'desc' },
    });

    if (baseJob) {
      const nextRank = rank.parse(baseJob.jobListRank).genPrev();
      if (nextRank.isMax() || nextRank.isMin()) {
        await this.rebalanceDB(jobListId);
        return this.genNextRank(jobListId);
      }
      return nextRank.toString();
    }
    const currentBucket = rank.middle().getBucket();
    return rank.initial(currentBucket).toString();
  }

  async getJobListData(
    jobListParam: JobListParamDto,
  ): Promise<{ jobListRank: string; jobListId: number }> {
    const { rank } = this;
    const { id, beforeJobId, afterJobId } = jobListParam;

    if (id) {
      const jobListRank = await this.genNextRank(id);
      return { jobListRank, jobListId: id };
    } else if (beforeJobId) {
      const jobBase = await this.getJob(beforeJobId);
      const { jobListId } = jobBase;

      const jobLeft = await this.prisma.job.findFirst({
        where: { jobListRank: { lt: jobBase.jobListRank } },
        select: { jobListRank: true },
        orderBy: { jobListRank: 'asc' },
      });

      const rankLeft = jobLeft?.jobListRank
        ? rank.parse(jobLeft?.jobListRank)
        : null;
      const rankBase = rank.parse(jobBase.jobListRank);

      if (rankLeft) {
        const jobListRank = this.getRankBetween(rankLeft, rankBase);
        if (jobListRank) return { jobListRank, jobListId };
        await this.rebalanceDB;
        return this.getJobListData(jobListParam);
      }

      const newRank = rankBase.genPrev();
      if (newRank.isMin()) {
        await this.rebalanceDB;
        return this.getJobListData(jobListParam);
      }
      const jobListRank = newRank.toString();
      return { jobListRank, jobListId };
    } else if (afterJobId) {
      const jobBase = await this.getJob(afterJobId);
      const { jobListId } = jobBase;

      const jobRight = await this.prisma.job.findFirst({
        where: { jobListRank: { gt: jobBase.jobListRank } },
        select: { jobListRank: true },
        orderBy: { jobListRank: 'desc' },
      });

      const rankRight = jobRight?.jobListRank
        ? rank.parse(jobRight?.jobListRank)
        : null;
      const rankBase = rank.parse(jobBase.jobListRank);

      if (rankRight) {
        const jobListRank = this.getRankBetween(rankRight, rankBase);
        if (jobListRank) return { jobListRank, jobListId };
        await this.rebalanceDB;
        return this.getJobListData(jobListParam);
      }

      const newRank = rankBase.genNext();
      if (newRank.isMin()) {
        await this.rebalanceDB;
        return this.getJobListData(jobListParam);
      }
      const jobListRank = newRank.toString();
      return { jobListRank, jobListId };
    }

    throw new BadRequestException(
      `${JobListParamDto.name} must have at least one property defined`,
    );
  }

  private async getJob(id: number): Promise<{
    jobListRank: string;
    jobListId: number;
  }> {
    const job = await this.prisma.job.findUnique({
      where: { id },
      select: { jobListRank: true, jobListId: true },
    });
    if (!job) throw new NotFoundException(`unable to find job ( ${id} )`);
    return job;
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
