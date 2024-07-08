import { PrismaService } from '@app/prisma';
import { Injectable, NotFoundException } from '@nestjs/common';
import { DeleteUserResDto } from './dto';
import { UserEntity } from './user.entity';
import { JobListDataService } from '@app/job/job-list-data.service';
import { AuthUser } from '@app/auth/dto';
import { UserDBService } from '@app/db/user-db.service';
import { JobListDBService } from '@app/db/job-list-db.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private jobListData: JobListDataService,
    private userDB: UserDBService,
    private jobListDB: JobListDBService,
  ) {}

  /** Get user profile */
  async userProfile(authUser: AuthUser): Promise<UserEntity> {
    const { Item: user } = await this.userDB.queryUnique(authUser.id);
    // const user = await this.prisma.user.findUnique({
    //   where: { id: userId },
    // });
    if (!user) throw new NotFoundException();
    return new UserEntity(user);
  }

  async createNewUserStarterData(user: AuthUser) {
    // create all job lists
    await Promise.all(
      ['Queue', 'Applied', 'Interview', 'Offer', 'Rejected'].map((label, idx) =>
        this.jobListDB.create({ label, order: idx + 1, userId: user.id }),
      ),
    );

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
    const { Attributes: deletedUser } = await this.userDB.delete(user.id);

    if (!deletedUser) throw new NotFoundException();

    return new DeleteUserResDto(deletedUser);
  }
}
