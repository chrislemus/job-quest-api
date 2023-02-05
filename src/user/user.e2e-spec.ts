import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '@app/app.module';
import { subscriberUserMock } from './user.mocks';
import { AuthTokens } from '@app/auth/dto';
import { UserEntity } from './user.entity';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { PrismaService } from '@app/prisma';
import { DeleteUserResDto } from './dto';
const userMock = subscriberUserMock;

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let jwt: AuthTokens;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: userMock.email, password: userMock.password })
      .then((res) => {
        const data = res.body.data;
        if (data.accessToken && data.refreshToken) {
          jwt = data;
        } else {
          throw new Error('could not authenticate');
        }
      });
  });

  describe('/user/profile (GET)', () => {
    it('requires auth', () => {
      return request(app.getHttpServer())
        .get('/user/profile')
        .expect(401)
        .then((data) => {
          expect(data.body.statusCode).toBe(401);
        });
    });
    it('provides profile data', () => {
      return request(app.getHttpServer())
        .get('/user/profile')
        .set('Authorization', `Bearer ${jwt.accessToken}`)
        .expect(200)
        .then(async (res) => {
          const data = res.body.data;
          const userProfile = plainToInstance(UserEntity, data);
          const validation = await validate(userProfile);
          expect(data.password).toBeFalsy();
          expect(validation).toHaveLength(0);
        });
    });
  });
  describe('/user/:id (DELETE)', () => {
    it('auth token must match id of user to delete', () => {
      return request(app.getHttpServer())
        .delete('/user/1')
        .set('Authorization', `Bearer ${jwt.accessToken}`)
        .expect(404)
        .then((data) => {
          expect(data.body.statusCode).toBe(404);
        });
    });
    it('successfully deletes user', async () => {
      const prisma = app.get(PrismaService);

      await request(app.getHttpServer())
        .delete(`/user/${userMock.id}`)
        .set('Authorization', `Bearer ${jwt.accessToken}`)
        .expect(200)
        .then(async (res) => {
          const data = plainToInstance(DeleteUserResDto, res.body.data);
          const validation = await validate(data);
          expect(validation).toHaveLength(0);

          const deletedUserId = data.id;
          expect(deletedUserId).toEqual(userMock.id);

          const secondUserQuery = await prisma.user.findUnique({
            where: { email: userMock.email },
          });
          expect(secondUserQuery).toEqual(null);
        });
    });
  });
});
