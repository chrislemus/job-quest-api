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

@Injectable()
export class JobListDataService {
  private rank = LexoRank;
  private logger = new Logger(JobListDataService.name);
  private rebalanceTracker: Record<number, number> = {};
  constructor(private prisma: PrismaService) {}

  async getJobListData(
    jobListParam: JobListDto,
  ): Promise<{ jobListRank: string; jobListId: number }> {
    const { id, beforeJobId, afterJobId } = jobListParam;

    if (id) {
      const jobListRank = await this.genNextRank(id);
      return { jobListRank, jobListId: id };
    } else if (beforeJobId) {
      return this.genSiblingRank(beforeJobId, 'before');
    } else if (afterJobId) {
      return this.genSiblingRank(afterJobId, 'after');
    }

    throw new BadRequestException(
      `${JobListDto.name} must have only one property defined`,
    );
  }

  private async genNextRank(jobListId: number): Promise<string> {
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
        return this.genNextRank(jobListId);
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

  private async genSiblingRank(
    baseJobId: number,
    direction: 'before' | 'after',
  ): Promise<{ jobListRank: string; jobListId: number }> {
    const { jobListId, baseRank, baseRankStr } = await this.prisma.job
      .findUnique({
        where: { id: baseJobId },
        select: { jobListRank: true, jobListId: true },
      })
      .then((job) => {
        if (job) {
          const { jobListId, jobListRank: baseRankStr } = job;
          const baseRank = this.rank.parse(baseRankStr);
          return { jobListId, baseRankStr, baseRank };
        }
        throw new NotFoundException(`unable to find job ( ${baseJobId} )`);
      });

    const retry = async () => {
      await this.rebalanceDB(jobListId);
      return this.genSiblingRank(baseJobId, direction);
    };

    const siblingRank = await this.prisma.job
      .findFirst({
        where: {
          jobListRank: {
            lt: direction === 'before' ? baseRankStr : undefined,
            gt: direction === 'after' ? baseRankStr : undefined,
          },
        },
        select: { jobListRank: true },
        orderBy: { jobListRank: direction === 'before' ? 'desc' : 'asc' },
      })
      .then((job) => (job ? this.rank.parse(job.jobListRank) : null));

    if (siblingRank) {
      const jobListRank = this.getRankBetween(siblingRank, baseRank);
      if (jobListRank) return { jobListRank, jobListId };
      return retry();
    }

    const newRank =
      direction === 'after' ? baseRank.genNext() : baseRank.genPrev();
    if (newRank.isMin() || newRank.isMax()) return retry();

    const jobListRank = newRank.toString();
    return { jobListRank, jobListId };
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
