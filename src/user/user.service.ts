import { Injectable, NotFoundException } from '@nestjs/common';
import { DeleteUserResDto } from './dto';
import { UserEntity } from './user.entity';
import { JobListDataService } from 'src/job/job-list-data.service';
import { AuthUser } from 'src/auth/dto';
import { UserDBService } from 'src/db/user-db.service';
import { JobListDBService } from 'src/db/job-list-db.service';

@Injectable()
export class UserService {
  constructor(
    private jobListData: JobListDataService,
    private userDB: UserDBService,
    private jobListDB: JobListDBService,
  ) {}

  /** Get user profile */
  async userProfile(authUser: AuthUser): Promise<UserEntity> {
    const user = await this.userDB.queryUnique(authUser.id);
    // const user = await this.prisma.user.findUnique({
    //   where: { id: userId },
    // });
    if (!user) throw new NotFoundException();
    return new UserEntity(user);
  }

  async createNewUserStarterData(user: AuthUser) {
    // create all job lists
    const jobListLabels = [
      'Queue',
      'Applied',
      'Interview',
      'Offer',
      'Rejected',
    ];
    const jobLists = jobListLabels.map((label) => ({ label }));
    await this.jobListDB.createMany(user.id, jobLists);
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

  /** Delete user */
  async delete(user: AuthUser): Promise<DeleteUserResDto> {
    // const deletedUser = await this.prisma.user.delete({
    //   where: { id: userId },
    // });
    // todo: delete all user data (jobs, job lists)
    // todo: delete all user data (jobs, job lists)
    // todo: delete all user data (jobs, job lists)
    // todo: delete all user data (jobs, job lists)
    // todo: delete all user data (jobs, job lists)
    // todo: delete all user data (jobs, job lists)
    // todo: delete all user data (jobs, job lists)
    // todo: delete all user data (jobs, job lists)
    // todo: delete all user data (jobs, job lists)
    // todo: delete all user data (jobs, job lists)
    // todo: delete all user data (jobs, job lists)
    // todo: delete all user data (jobs, job lists)
    // todo: delete all user data (jobs, job lists)
    // todo: delete all user data (jobs, job lists)
    const deletedUser = await this.userDB.delete(user.id);

    if (!deletedUser) throw new NotFoundException();

    return new DeleteUserResDto(deletedUser);
  }
}
