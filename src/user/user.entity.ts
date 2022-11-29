import { Role, User } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserEntity implements User {
  id: number;
  createdAt: Date;
  email: string;
  firstName: string;
  lastName: string | null;
  @Exclude()
  password: string;
  @Exclude()
  refreshToken: string;
  role: Role;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
