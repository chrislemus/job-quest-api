import { internalServerException } from '@/shared';
import { LexoRank } from 'lexorank';
import { JobListRankDto } from '../dto';
import { JobQuestDBService } from '@/core/database';

async function getJobListData(
  userId: string,
  jobListId: string,
  jobListRankConfig?: JobListRankDto,
): Promise<{
  jobRank: string;
  jobListId: string;
}> {
  const getData = async () => {
    const config = { jobListId, jobListRankConfig };
    const jobListRanksDbRes = await JobQuestDBService.entities.jobRank.query
      .jobRank({
        jobListId,
        // jobRank: jobListRankConfig?.rank,
      })
      .where((attr, op) => {
        const rank = jobListRankConfig?.rank;
        if (!rank) return '';
        if (jobListRankConfig?.placement === 'bottom') {
          return op.gte(attr.jobRank, rank);
        }
        const condition = op.lte(attr.jobRank, rank);
        console.log({ condition });
        return condition;
      })
      .go({ limit: 2 });
    console.log({ jobListRanksDbRes });
    const jobListRanksDbResData = jobListRanksDbRes.data;
    console.log({ jobListRanksDbResData });
    const topRank = jobListRanksDbRes.data[0]?.jobRank;
    const bottomRank = jobListRanksDbRes.data[1]?.jobRank;
    const jobListRanks = { topRank, bottomRank };

    const data = await getRankPlacement({ ...config, jobListRanks });
    return data;
  };

  let res = await getData();
  if (res === 'rebalance required') {
    await rebalanceDB(jobListId, userId);
    res = await getData();
  }

  if (res === 'rebalance required') {
    console.error('Rebalance required after 2nd attempt');
    throw internalServerException('failed to rebalance job ranks');
  }

  return res;
}

async function getRankPlacement(config: {
  jobListId: string;
  jobListRankConfig?: JobListRankDto;
  jobListRanks: { topRank?: string; bottomRank?: string };
}): Promise<
  | {
      jobRank: string;
      jobListId: string;
    }
  | 'rebalance required'
> {
  const rebalanceRes = 'rebalance required' as const;
  const rank = LexoRank;
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
    return { jobRank: newRank, jobListId };
  }

  // condition must return a value
  if (topRank || bottomRank) {
    const baseRank = (topRank || bottomRank) as LexoRank;
    const rankBottom = jobListRankConfig?.placement === 'bottom';
    const newRank = rankBottom ? baseRank.genNext() : baseRank.genPrev();

    const limitReached = newRank.isMax() || newRank.isMin();
    if (limitReached) return rebalanceRes;
    return { jobListId, jobRank: newRank.toString() };
  }

  const currentBucket = rank.middle().getBucket();
  const jobRank = rank.initial(currentBucket).toString();
  return { jobRank, jobListId };
}

async function rebalanceDB(jobListId: string, userId: string) {
  throw internalServerException('Method not implemented.');
}

// private logger = new Logger(JobListDataService.name);
// constructor(private jobListJobRank: JobListJobRankDBService) {}
export const jobListDataUtil = { getJobListData };
