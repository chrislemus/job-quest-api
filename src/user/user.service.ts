import { PrismaService } from '@app/prisma';
import { Injectable } from '@nestjs/common';
import { UserProfile } from './dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async userProfile(userId: number): Promise<UserProfile> {
    const profile = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    return new UserProfile(profile);
  }
}
