import { internalServerException } from '@/common';
import { LexoRank } from 'lexorank';
import { JobListRankDtoInput } from './dto';
import { jobListJobRankDB } from '@/db/job-list-job-rank-db.service';

async function getJobListData(
  userId: string,
  jobListId: string,
  jobListRankConfig?: JobListRankDtoInput,
): Promise<{
  jobListRank: string;
  jobListId: string;
}> {
  const getData = async () => {
    const config = { jobListId, jobListRankConfig };
    const jobListRanks = await jobListJobRankDB.getTopAndBottomJobListRanks(
      jobListId,
      jobListRankConfig,
    );

    const data = await getRankPlacement({ ...config, jobListRanks });
    return data;
  };

  let res = await getData();

  if (res === 'rebalance required') {
    await rebalanceDB(jobListId, userId);
  }

  res = await getData();

  if (res === 'rebalance required') {
    console.error('Rebalance required after 2nd attempt');

    throw internalServerException('failed to rebalance job list ranks');
  }

  return res;
}

async function getRankPlacement(config: {
  jobListId: string;
  jobListRankConfig?: JobListRankDtoInput;
  jobListRanks: { topRank?: string; bottomRank?: string };
}): Promise<
  | {
      jobListRank: string;
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

async function rebalanceDB(jobListId: string, userId: string) {
  throw internalServerException('Method not implemented.');
}

// private logger = new Logger(JobListDataService.name);
// constructor(private jobListJobRank: JobListJobRankDBService) {}
export const jobListDataUtil = { getJobListData };
