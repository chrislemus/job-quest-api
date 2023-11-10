import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Mocked, vi } from 'vitest';

vi.mock('./user.service');

describe('UserController', async () => {
  let controller: UserController;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let userService: Mocked<UserService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
      controllers: [UserController],
    }).compile();
    controller = module.get<UserController>(UserController);
    userService = module.get<Mocked<UserService>>(UserService);
    vi.resetAllMocks();
  });

  it('should be defined', async () => {
    expect(controller).toBeDefined();
  });
  it('second', async () => {
    expect(controller).toBeDefined();
  });
});
