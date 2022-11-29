import { Page, pageQuery } from '@app/common/pagination';
import { PrismaService } from '@app/prisma';
import { UserEntity } from '@app/user/user.entity';
import { Injectable } from '@nestjs/common';
import { FindAllUsersDto } from './dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  /** Find all users */
  async findAll(findAllUsers: FindAllUsersDto): Promise<Page<UserEntity>> {
    const data = await pageQuery({
      pageConfig: findAllUsers,
      queryFn: this.prisma.user.findMany,
      countFn: this.prisma.user.count,
      dataSerializer: UserEntity,
    });

    return data;
  }
}
