import { AuthUser } from '@app/auth/dto';
import { PrismaService } from '@app/prisma';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async deleteMany(userIds: number[]) {
    // const user = await this.prisma.user.findUnique({
    //   where: { id: config.userId },
    //   select: { id: true },
    // });
    // const canDelete =
    // if (user?.id !== config.authUserId.id) throw new NotFoundException();
    // const deletedJOb = await this.prisma.job.deleteMany({ where: { id: jobId } });
    // return deletedJOb;
  }
}
