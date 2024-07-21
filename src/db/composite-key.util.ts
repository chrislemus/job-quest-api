export type JobCK = {
  pk: `user#${string}#job`;
  sk: `job#${string}`;
};

export function getJobCK(data: { userId: string; jobId: string }): {
  pk: `user#${string}#job`;
  sk: `job#${string}`;
} {
  const { userId, jobId } = data;
  return { pk: `user#${userId}#job`, sk: `job#${jobId}` } as JobCK;
}

export type JobCountCK = {
  pk: `user#${string}#jobCount`;
  sk: `"count"`;
};

export function getJobCountCK(data: { userId: string }): JobCountCK {
  const { userId } = data;
  return { pk: `user#${userId}#jobCount`, sk: `"count"` };
}

export type JobListJobRankCK = {
  pk: `jobList#${string}#jobRank`;
  sk: `jobRank#${string}`;
};

export function getJobListJobRankCK(data: {
  jobListId: string;
  jobListRank: string;
}): JobListJobRankCK {
  const { jobListId, jobListRank } = data;
  return { pk: `jobList#${jobListId}#jobRank`, sk: `jobRank#${jobListRank}` };
}

export type JobListCK = {
  pk: `user#${string}#jobList`;
  sk: `jobList#${string}`;
};

export function getJobListCK(data: {
  userId: string;
  jobListId: string;
}): JobListCK {
  const { userId, jobListId } = data;
  return { pk: `user#${userId}#jobList`, sk: `jobList#${jobListId}` };
}

export type UserCK = {
  pk: `user#${string}`;
  sk: `"info"`;
};
export function createUserCK(data: { userId: string }): UserCK {
  const { userId } = data;
  return { pk: `user#${userId}`, sk: `"info"` };
}
