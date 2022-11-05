import { PrismaService } from '@app/prisma';
import { Injectable } from '@nestjs/common';
import { UserEntity } from './user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // findUniqueByEmail(email: string): Promise<UserEntity | null> {
  //   return this.prisma.user.findUnique({ where: { email } });
  // }

  // async createUser(user: CreateUserDto) {
  //   const salt = await bcrypt.genSalt(10);
  //   const password = await bcrypt.hash(user.password, salt);

  //   return this.prisma.user.create({
  //     data: { ...user, password },
  //   });
  // }
}
