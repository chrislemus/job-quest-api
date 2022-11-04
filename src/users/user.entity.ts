import { User } from '@prisma/client';

export class UserEntity implements User {
  id: number;
  email: string;
  firstName: string;
  lastName: string | null;
  password: string;
}
