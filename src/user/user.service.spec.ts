import { PrismaService } from '@app/prisma';
import { Test, TestingModule } from '@nestjs/testing';
import { Role, User } from '@prisma/client';
import { UserService } from './user.service';

import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

export type Context = {
  prisma: PrismaService;
};

export type MockContext = {
  prisma: DeepMockProxy<PrismaService>;
};

export const createMockContext = (): MockContext => {
  return {
    prisma: mockDeep<PrismaService>(),
  };
};

let mockCtx: MockContext;
let ctx: Context;

beforeEach(() => {
  mockCtx = createMockContext();
  ctx = mockCtx as unknown as Context;
});

describe('UsersService', () => {
  // let prisma: PrismaService = { user: {} } as PrismaService;
  let service: UserService;
  let mockCtx: MockContext;
  let ctx: Context;
  // const prisma = {};

  beforeEach(async () => {
    mockCtx = createMockContext();
    ctx = mockCtx as unknown as Context;
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, { provide: PrismaService, useValue: ctx }],
    }).compile();

    // prisma = { user: {} } as PrismaService;
    service = module.get<UserService>(UserService);
  });

  // it('should be defined', () => {
  //   expect(service).toBeDefined();
  // });

  it('test', async () => {
    const user: User = {
      id: 888,
      createdAt: new Date(),
      email: 'user@me.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'hello123',
      refreshToken: 'ferferfer',
      role: Role.SUBSCRIBER,
    };
    // prisma.user.findUnique = async (..._args: any) => {
    //   return user;
    // };
    // prisma.user.findUnique = jest.fn().mockImplementationOnce(async () => {
    //   return user;
    // });
    mockCtx.prisma.user.findUnique.mockReturnValueOnce(user as any);
    const userResponse = await service.userProfile(888);

    expect(userResponse).toEqual(user);
  });
});
