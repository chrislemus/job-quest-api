export type JobCK = ReturnType<typeof getJobCK>;
type JobCKInput = { userId: string; jobId: string };
export function getJobCK(input: JobCKInput) {
  const { userId, jobId } = input;
  return { pk: `user#${userId}#job`, sk: `job#${jobId}` } as const;
}

export type JobListCK = ReturnType<typeof getJobListCK>;
type JobListCKInput = { userId: string; jobListId: string };
export function getJobListCK(input: JobListCKInput) {
  const { userId, jobListId } = input;
  return { pk: `user#${userId}#jobList`, sk: `jobList#${jobListId}` } as const;
}
export type JobListJobRankCK = ReturnType<typeof getJobListJobRankCK>;
type JobListJobRankCKInput = { jobListId: string; jobListRank: string };
export function getJobListJobRankCK(input: JobListJobRankCKInput) {
  const { jobListId, jobListRank } = input;
  return {
    pk: `jobList#${jobListId}#jobRank`,
    sk: `jobRank#${jobListRank}`,
  } as const;
}

export type JobLogCK = ReturnType<typeof getJobLogCK>;
type JobLogCKInput = { userId: string; jobLogId: string };
export function getJobLogCK(input: JobLogCKInput) {
  const { userId, jobLogId } = input;
  return { pk: `user#${userId}#jobLog`, sk: `jobLog#${jobLogId}` } as const;
}

export type JobCountCK = ReturnType<typeof getJobCountCK>;
type JobCountCKInput = { userId: string };
export function getJobCountCK(input: JobCountCKInput) {
  const { userId } = input;
  return { pk: `user#${userId}#jobCount`, sk: `"count"` } as const;
}

export type UserCK = ReturnType<typeof createUserCK>;
type UserCKInput = { id: string };
export function createUserCK(input: UserCKInput) {
  const { id } = input;
  return { pk: `user#${id}`, sk: `"info"` } as const;
}
