import { createMockJobList } from '../models/job-list.model';
import { createMockJobRank } from '../models/job-rank.model';
import { createMockJob } from '../models/job.model';
import { createMockUser } from '../models/user.model';
import { createItems } from '../utils';

export function createMockData() {
  const users = createItems(1, () => createMockUser());

  const jobListLabels = ['Queue', 'Applied'];
  const jobLists = users.flatMap((user) => {
    const { userId } = user;
    return jobListLabels.map((label, index) => {
      const order = index + 1;
      return createMockJobList({ userId, label, order });
    });
  });

  const jobs = jobLists.flatMap((jobList) => {
    const { userId, jobListId } = jobList;
    const jobRanks = ['AAAA', 'BBBB'];
    const jobs = jobRanks.map((jobRank) => {
      return createMockJob({ userId, jobListId, jobRank });
    });
    return jobs;
  });

  const jobRanks = jobs.map((job) => {
    const { jobListId, jobRank, jobId } = job;
    return createMockJobRank({ jobListId, jobRank, jobId });
  });

  return { users, jobLists, jobs, jobRanks };
}
