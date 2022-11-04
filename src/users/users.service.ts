import { PrismaService } from '@app/prisma';
import { Injectable } from '@nestjs/common';

// This should be a real class/interface representing a user entity
export type User = any;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findUnique(username: string): Promise<User | undefined> {
    return this.prisma.user.findUnique({ where: { email: username } });
  }

  findMany() {
    return this.prisma.user.findMany();
  }
}
