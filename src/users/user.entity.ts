import { User } from '@prisma/client';

export class UserEntity implements User {
  id: number;
  createdAt: Date;
  email: string;
  firstName: string;
  lastName: string | null;
  password: string;
  refreshToken: string;
}
