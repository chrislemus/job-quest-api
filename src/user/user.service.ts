import { PrismaService } from '@app/prisma';
import { Injectable } from '@nestjs/common';
import { DeleteUserResDto, UserProfile } from './dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async userProfile(userId: number): Promise<UserProfile> {
    const profile = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    return new UserProfile(profile);
  }

  /** Delete user */
  async delete(userId: number): Promise<DeleteUserResDto> {
    const deletedUser = await this.prisma.user.delete({
      where: { id: userId },
    });
    return new DeleteUserResDto(deletedUser);
  }
}
