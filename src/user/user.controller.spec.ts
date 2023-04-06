// import { Test, TestingModule } from '@nestjs/testing';
// import { UserController } from './user.controller';

// describe('UserController', () => {
//   let controller: UserController;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [UserController],
//     }).compile();

//     controller = module.get<UserController>(UserController);
//   });

//   it('should be defined', () => {
//     expect(controller).toBeDefined();
//   });
// });
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ExecutionContext } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '@app/app.module';
import { PrismaService } from '@app/prisma';
import { JwtAuthGuard } from '@app/auth/guards';
import { AuthUser } from '@app/auth/dto';
import { Role } from '.prisma/client';
import { MockContext, createMockContext } from '@app/prisma/prisma.mock';
import { UserEntity } from './user.entity';
import { User } from '@prisma/client';

const adminUser: User = {
  id: 1,
  firstName: 'Mike',
  lastName: 'Tyson',
  createdAt: new Date(),
  email: 'hello@me.com',
  password: 'hello123',
  refreshToken: null,
  role: Role.ADMIN,
};

class MockJwtAuthGuard {
  user?: AuthUser;

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const { user } = this;

    if (user) {
      const auth: AuthUser = {
        id: user.id,
        email: user.email,
        role: user.role,
      };
      req.user = auth;
    }
    return !!user;
  }
}

describe('AppController (e2e)', () => {
  let ctx: MockContext;
  let app: INestApplication;

  let authGuard: MockJwtAuthGuard;

  beforeEach(async () => {
    ctx = createMockContext();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(ctx.prisma)
      // .overrideProvider(JwtAuthGuard)
      // .useClass(MockJwtAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();

    // authGuard = app.get(JwtAuthGuard);
    // authGuard.user = adminUser;

    await app.init();
  });

  it('/user/profile (GET)', async () => {
    ctx.prisma.user.findUnique.mockImplementationOnce(() => {
      // console.log(args);
      // const user: UserEntity = adminUser;
      return adminUser as any;
    });
    // prisma.user.
    const user = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'cris@me.com', password: 'helloTher' }).;
    console.log(user);

    // const user = auth.hashValue;
    return request(app.getHttpServer())
      .get('/user/profile')
      .auth('455454685', { type: 'bearer' })
      .expect(200)
      .expect('Hello World!');
  });
  afterAll(async () => {
    await app.close();
  });
});
