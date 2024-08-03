import { Test, TestingModule } from '@nestjs/testing';
import { JobListDataService } from './job-list-data.service';
import { LexoRank } from 'lexorank';

type Direction = 'before' | 'after';

const jobsWithRank = (
  direction: Direction,
  startRank: 'max' | 'min' | 'middle',
  count: number,
) => {
  let rank = LexoRank[startRank]();

  const jobs: { id: number; jobListRank: string; jobListId: number }[] = [];

  for (let id = 1; id <= count; id++) {
    const jobListRank = rank.toString();
    jobs.push({ id, jobListRank, jobListId: 1 });
    rank = direction === 'before' ? rank.genPrev() : rank.genNext();
  }
  return jobs;
};

describe.skip('JobListDataService', () => {
  // let service: JobListDataService;
  // const prisma = {
  //   job: {
  //     findFirst: jest.fn(),
  //     findMany: jest.fn(),
  //     findUnique: jest.fn(),
  //   },
  //   $transaction: jest.fn(),
  // };
  // beforeEach(async () => {
  //   const module: TestingModule = await Test.createTestingModule({
  //     providers: [
  //       JobListDataService,
  //       { provide: PrismaService, useValue: prisma },
  //     ],
  //   }).compile();
  //   service = module.get<JobListDataService>(JobListDataService);
  // });
  // describe('JobListDto.id', () => {
  //   it('Provides initial rank when job list has no assigned jobs', async () => {
  //     prisma.job.findFirst.mockReturnValueOnce(null);
  //     const bucket = LexoRank.middle().getBucket();
  //     const jobListRank = LexoRank.initial(bucket).toString();
  //     const jobListId = 1;
  //     const jobListData = await service.getJobListData({ id: jobListId });
  //     expect(jobListData).toMatchObject({ jobListId, jobListRank });
  //   });
  //   it('Provides new next rank', async () => {
  //     const existingRank = LexoRank.middle();
  //     prisma.job.findFirst.mockReturnValueOnce({
  //       jobListRank: existingRank.toString(),
  //     });
  //     const jobListRank = existingRank.genNext().toString();
  //     const jobListId = 1;
  //     const jobListData = await service.getJobListData({ id: jobListId });
  //     expect(jobListData).toMatchObject({ jobListId, jobListRank });
  //   });
  //   it('Rebalances and returns new job list rank', async () => {
  //     const jobs = jobsWithRank('before', 'max', 1);
  //     const lastJob = () => jobs[jobs.length - 1]; // fn to handle mutation
  //     const { jobListId } = jobs[0];
  //     prisma.job.findFirst.mockReturnValueOnce(jobs[0]);
  //     prisma.job.findMany.mockReturnValueOnce(jobs);
  //     prisma.$transaction.mockImplementationOnce((cb: (tx) => void) => {
  //       const update = ({ where: { id }, data: { jobListRank } }) => {
  //         const jobIdx = jobs.findIndex((j) => j.id === id);
  //         jobs[jobIdx].jobListRank = jobListRank;
  //       };
  //       const tx = { job: { update } };
  //       cb(tx);
  //     });
  //     prisma.job.findFirst.mockReturnValueOnce(lastJob());
  //     const jobListData = await service.getJobListData({ id: jobListId });
  //     const lastJobRank = LexoRank.parse(lastJob().jobListRank);
  //     const jobListRank = lastJobRank.genNext().toString();
  //     expect(jobListData).toEqual({ jobListId, jobListRank });
  //   });
  //   it('Job list rank rebalancing is rate limited (avoids infinite loop)', async () => {
  //     const jobs = jobsWithRank('before', 'max', 1);
  //     prisma.job.findFirst.mockReturnValue(jobs[0]);
  //     prisma.job.findMany.mockReturnValue(jobs);
  //     let errorCount = 0;
  //     await service.getJobListData({ id: 1 }).catch((e) => {
  //       errorCount++;
  //     });
  //     expect(errorCount).toBe(1);
  //   });
  // });
  // describe('JobListDto.(beforeJobId | afterJobId)', () => {
  //   it.each(['before', 'after'] as Direction[])(
  //     '%sJobId correctly returns rank',
  //     async (direction: 'before' | 'after') => {
  //       // getJob depends on jobs length to be 3
  //       const jobs = jobsWithRank('before', 'middle', 1);
  //       // fn to get latest mutated data
  //       const baseJob = () => jobs[0];
  //       const { jobListId } = baseJob();
  //       prisma.job.findUnique.mockImplementation(({ where: { id } }) => {
  //         return jobs.find((j) => j.id === id);
  //       });
  //       // sibling query not required
  //       prisma.job.findFirst.mockReturnValue(null);
  //       const jobList = {};
  //       jobList[`${direction}JobId`] = baseJob().id;
  //       const jobListData = await service.getJobListData(jobList);
  //       const baseRank = LexoRank.parse(baseJob().jobListRank);
  //       const siblingRank =
  //         direction === 'before' ? baseRank.genPrev() : baseRank.genNext();
  //       const jobListRank = siblingRank.toString();
  //       expect(jobListData).toEqual({ jobListRank, jobListId });
  //     },
  //   );
  //   it.each(['before', 'after'] as Direction[])(
  //     'SIBLING RANK - %sJobId  correctly returns rank between siblings',
  //     async (direction: Direction) => {
  //       const jobs = jobsWithRank('before', 'middle', 3);
  //       const [beforeJob, baseJob, afterJob] = jobs;
  //       const { jobListId } = baseJob;
  //       prisma.job.findUnique.mockImplementationOnce(({ where: { id } }) => {
  //         return jobs.find((j) => j.id === id);
  //       });
  //       prisma.job.findFirst.mockImplementationOnce((args) => {
  //         const { lt, gt } = args.where.jobListRank;
  //         const sort = args.orderBy.jobListRank;
  //         const rank = baseJob.jobListRank;
  //         if (lt === rank && sort === 'desc') return beforeJob;
  //         if (gt === rank && sort === 'asc') return afterJob;
  //         throw Error('invalid prisma query');
  //       });
  //       const jobList = {};
  //       jobList[`${direction}JobId`] = baseJob.id;
  //       const jobListData = await service.getJobListData(jobList);
  //       const baseRank = LexoRank.parse(baseJob.jobListRank);
  //       const sibling = direction === 'before' ? beforeJob : afterJob;
  //       const siblingRank = LexoRank.parse(sibling.jobListRank);
  //       const jobListRank = siblingRank.between(baseRank).toString();
  //       expect(jobListData).toEqual({ jobListRank, jobListId });
  //     },
  //   );
  //   it.each(['before', 'after'] as Direction[])(
  //     '%sJobId rebalances DB and correctly returns rank',
  //     async (direction: 'before' | 'after') => {
  //       // getJob depends on jobs length to be 3
  //       const startRank = direction === 'before' ? 'min' : 'max';
  //       const jobs = jobsWithRank('before', startRank, 1);
  //       // fn to get latest mutated data
  //       const baseJob = () => jobs[0];
  //       const { jobListId } = baseJob();
  //       prisma.job.findUnique.mockImplementation(({ where: { id } }) => {
  //         return jobs.find((j) => j.id === id);
  //       });
  //       // sibling query not required
  //       prisma.job.findFirst.mockReturnValue(null);
  //       // start rebalance
  //       prisma.job.findMany.mockReturnValue(jobs);
  //       prisma.$transaction.mockImplementationOnce((cb: (tx) => void) => {
  //         const update = ({ where: { id }, data: { jobListRank } }) => {
  //           const jobIdx = jobs.findIndex((j) => j.id === id);
  //           jobs[jobIdx].jobListRank = jobListRank;
  //         };
  //         const tx = { job: { update } };
  //         cb(tx);
  //       });
  //       const jobList = {};
  //       jobList[`${direction}JobId`] = baseJob().id;
  //       const jobListData = await service.getJobListData(jobList);
  //       const baseRank = LexoRank.parse(baseJob().jobListRank);
  //       const siblingRank =
  //         direction === 'before' ? baseRank.genPrev() : baseRank.genNext();
  //       const jobListRank = siblingRank.toString();
  //       expect(jobListData).toEqual({ jobListRank, jobListId });
  //     },
  //   );
  //   it.each(['before', 'after'] as Direction[])(
  //     'SIBLING RANK - %sJobId rebalances DB and correctly returns rank between siblings',
  //     async (direction: 'before' | 'after') => {
  //       // getJob depends on jobs length to be 3
  //       const jobs = jobsWithRank('before', 'middle', 3);
  //       jobs.forEach((_j, idx) => {
  //         if (idx !== 1) jobs[idx].jobListRank = jobs[1].jobListRank;
  //       });
  //       // fn to get latest mutated data
  //       const beforeJob = () => jobs[0];
  //       const baseJob = () => jobs[1];
  //       const afterJob = () => jobs[2];
  //       const { jobListId } = baseJob();
  //       prisma.job.findUnique.mockImplementation(({ where: { id } }) => {
  //         return jobs.find((j) => j.id === id);
  //       });
  //       prisma.job.findFirst.mockReturnValue(
  //         direction === 'before' ? beforeJob() : afterJob(),
  //       );
  //       // start rebalance
  //       prisma.job.findMany.mockReturnValue(jobs);
  //       prisma.$transaction.mockImplementationOnce((cb: (tx) => void) => {
  //         const update = ({ where: { id }, data: { jobListRank } }) => {
  //           const jobIdx = jobs.findIndex((j) => j.id === id);
  //           jobs[jobIdx].jobListRank = jobListRank;
  //         };
  //         const tx = { job: { update } };
  //         cb(tx);
  //       });
  //       const jobList = {};
  //       jobList[`${direction}JobId`] = baseJob().id;
  //       const jobListData = await service.getJobListData(jobList);
  //       const baseRank = LexoRank.parse(baseJob().jobListRank);
  //       const sibling = direction === 'before' ? beforeJob() : afterJob();
  //       const siblingRank = LexoRank.parse(sibling.jobListRank);
  //       const jobListRank = siblingRank.between(baseRank).toString();
  //       expect(jobListData).toEqual({ jobListRank, jobListId });
  //     },
  //   );
  //   it.each(['before', 'after'] as Direction[])(
  //     '%sJobId Job list rank rebalancing is rate limited (avoids infinite loop)',
  //     async (direction: 'before' | 'after') => {
  //       // getJob depends on jobs length to be 3
  //       const startRank = direction === 'before' ? 'min' : 'max';
  //       const jobs = jobsWithRank('before', startRank, 1);
  //       // fn to get latest mutated data
  //       const baseJob = jobs[0];
  //       prisma.job.findUnique.mockImplementation(({ where: { id } }) => {
  //         return jobs.find((j) => j.id === id);
  //       });
  //       prisma.job.findFirst.mockReturnValue(null); // sibling query not required
  //       prisma.job.findMany.mockReturnValue(jobs);
  //       const jobList = {};
  //       jobList[`${direction}JobId`] = baseJob.id;
  //       let errorCount = 0;
  //       await service.getJobListData(jobList).catch(() => {
  //         errorCount++;
  //       });
  //       expect(errorCount).toBe(1);
  //     },
  //   );
  //   it.each(['before', 'after'] as Direction[])(
  //     'SIBLING RANK - %sJobId Job list rank rebalancing is rate limited (avoids infinite loop)',
  //     async (direction: 'before' | 'after') => {
  //       // getJob depends on jobs length to be 3
  //       const jobs = jobsWithRank('before', 'middle', 3);
  //       jobs.forEach((_j, idx) => {
  //         if (idx !== 1) jobs[idx].jobListRank = jobs[1].jobListRank;
  //       });
  //       const [beforeJob, baseJob, afterJob] = jobs;
  //       prisma.job.findUnique.mockImplementation(({ where: { id } }) => {
  //         return jobs.find((j) => j.id === id);
  //       });
  //       prisma.job.findFirst.mockReturnValue(
  //         direction === 'before' ? beforeJob : afterJob,
  //       );
  //       prisma.job.findMany.mockReturnValue(jobs);
  //       const jobList = {};
  //       jobList[`${direction}JobId`] = baseJob.id;
  //       let errorCount = 0;
  //       await service.getJobListData(jobList).catch((_e) => {
  //         errorCount++;
  //       });
  //       expect(errorCount).toEqual(1);
  //     },
  //   );
  // });
});
