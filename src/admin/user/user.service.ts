import { Page, pageQuery } from '@app/common/pagination';
import { PrismaService } from '@app/prisma';
import { UserEntity } from '@app/user/user.entity';
import { Injectable } from '@nestjs/common';
import { DeleteUserResDto, FindAllUsersDto } from './dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  /** Find all users */
  findAll(findAllUsers: FindAllUsersDto): Promise<Page<UserEntity>> {
    return pageQuery({
      pageConfig: findAllUsers,
      queryFn: this.prisma.user.findMany,
      countFn: this.prisma.user.count,
    });
  }

  /** Delete a user */
  async delete(userId: number): Promise<DeleteUserResDto> {
    const deletedUser = await this.prisma.user.delete({
      where: { id: userId },
    });
    return new DeleteUserResDto(deletedUser);
  }
}
