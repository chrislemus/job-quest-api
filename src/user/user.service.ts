import { PrismaService } from '@app/prisma';
import { Injectable } from '@nestjs/common';
import { DeleteUserResDto } from './dto';
import { UserEntity } from './user.entity';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  /** Get user profile */
  async userProfile(userId: number): Promise<UserEntity> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    return new UserEntity(user);
  }

  /** Delete user */
  async delete(userId: number): Promise<DeleteUserResDto> {
    const deletedUser = await this.prisma.user.delete({
      where: { id: userId },
    });
    return new DeleteUserResDto(deletedUser);
  }
}
