import { PrismaService } from '@app/prisma';
import { Injectable, NotFoundException } from '@nestjs/common';
import { DeleteUserResDto } from './dto';
import { UserEntity } from './user.entity';
import { JobListDataService } from '@app/job/job-list-data.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private jobListData: JobListDataService,
  ) {}

  /** Get user profile */
  async userProfile(userId: number): Promise<UserEntity> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException();
    return new UserEntity(user);
  }

  async createNewUserStarterData(userId: number) {
    // create all job lists
    await this.prisma.jobList.createMany({
      data: ['Queue', 'Applied', 'Interview', 'Offer', 'Rejected'].map(
        (label, idx) => ({ label, order: idx + 1, userId }),
      ),
    });

    // create sample job
    const firstJob = await this.prisma.jobList.findFirst({
      where: { userId },
    });

    if (firstJob) {
      const { jobListRank, jobListId } = await this.jobListData.getJobListData({
        id: firstJob.id,
      });

      await this.prisma.job.create({
        data: {
          title: 'Sales Associate',
          company: 'Job Quest',
          location: 'Raleigh, NC',
          salary: '50k',
          color: '#e91e63',
          description: 'This is a sample job',
          userId,
          jobListId,
          jobListRank,
        },
      });
    }
  }

  /** Delete user */
  async delete(userId: number): Promise<DeleteUserResDto> {
    const deletedUser = await this.prisma.user.delete({
      where: { id: userId },
    });
    return new DeleteUserResDto(deletedUser);
  }
}
