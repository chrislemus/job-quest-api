import { AuthService } from '@app/auth/auth.service';
import { Role } from '@prisma/client';
import { UserEntity } from './user.entity';

export type UserMock = Omit<UserEntity, 'createdAt' | 'refreshToken'>;

export const adminUserMock: UserMock = {
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@me.com',
  role: Role.ADMIN,
  password: 'hello123',
};

export const subscriberUserMock: UserMock = {
  id: 2,
  firstName: 'Alex',
  lastName: 'Myers',
  email: 'alex@me.com',
  role: Role.SUBSCRIBER,
  password: 'hello456',
};

export const hashUserMock = async (user: UserMock): Promise<UserMock> => {
  const auth = new AuthService({} as any, {} as any, {} as any);
  const password = await auth.hashValue(user.password);
  return { ...user, password };
};
