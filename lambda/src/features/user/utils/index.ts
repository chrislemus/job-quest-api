// import { jobListDB } from '@/shared/db/job-list-db.service';
import { UserDto } from '../dto';
import { JobQuestDBService } from '@/core/database';
import { CreateJobListItem } from '@/core/database/models/job-list.model';

export async function createNewUserStarterData(user: UserDto) {
  const jobListLabels = ['Queue', 'Applied', 'Interview', 'Offer', 'Rejected'];
  const jobLists: CreateJobListItem[] = jobListLabels.map((label, idx) => ({
    label,
    order: idx + 1,
    userId: user.id,
  }));
  // await jobListDB.createMany(user.id, jobLists);
  await JobQuestDBService.transaction
    .write((entity) => [
      ...jobLists.map((data) => entity.jobList.create(data).commit()),
    ])
    .go();
  console.log('partial implementation');
  console.log('partial implementation');
  console.log('partial implementation');
  console.log('partial implementation');
  console.log('partial implementation');
  console.log('partial implementation');
  console.log('partial implementation');
  console.log('partial implementation');
  console.log('partial implementation');
  console.log('partial implementation');
  console.log('partial implementation');
  console.log('partial implementation');
  console.log('partial implementation');
  console.log('partial implementation');
  console.log('partial implementation');
  console.log('partial implementation');
  console.log('partial implementation');
  console.log('partial implementation');
  console.log('partial implementation');
  console.log('partial implementation');
  console.log('partial implementation');
  console.log('partial implementation');
  console.log('partial implementation');
  console.log('partial implementation');
  console.log('partial implementation');
  console.log('partial implementation');
  console.log('partial implementation');
  console.log('partial implementation');
  console.log('partial implementation');
  console.log('partial implementation');
  console.log('partial implementation');
  // await Promise.all(
  //   ['Queue', 'Applied', 'Interview', 'Offer', 'Rejected'].map((label, idx) =>
  //     this.jobListDB.create({ label, order: idx + 1, userId: user.id }),
  //   ),
  // );

  // await this.jobListDB.create({
  //   label: 'Queue',
  //   userId,
  // });
  // create sample job
  // const firstJob = await this.prisma.jobList.findFirst({
  //   where: { userId },
  // });
  // if (firstJob) {
  //   const { jobListRank, jobListId } = await this.jobListData.getJobListData({
  //     id: firstJob.id,
  //   });
  //   await this.prisma.job.create({
  //     data: {
  //       title: 'Sales Associate',
  //       company: 'Job Quest',
  //       location: 'Raleigh, NC',
  //       salary: '50k',
  //       color: '#e91e63',
  //       description: 'This is a sample job',
  //       userId,
  //       jobListId,
  //       jobListRank,
  //     },
  //   });
  // }
}
