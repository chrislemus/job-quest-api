// const user = users[0];
// const userSchema = z.object({
//   id: z.string().min(15),
//   email: z.literal(user.email),
//   firstName: z.literal(user.firstName),
//   lastName: z.literal(user.lastName),
//   role: z.literal('SUBSCRIBER'),
// });

import { z } from 'zod';
import { appUrl } from './app-urls.const';
import { User } from './mocks/user.mock';
import { objSize } from './utils';

const deleteUserResSchema = z.object({
  data: z.object({
    id: z.string().min(15),
  }),
});

const userProfileResSchema = z.object({
  data: z.object({
    id: z.string().min(15),
    email: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    role: z.string(),
  }),
});

describe('/user (e2e)', () => {
  // let accessToken: string;
  // let refreshToken: string;

  // it('temp', () => {
  //   expect(1).toBe(1);
  // });
  // beforeEach(async () => {
  //   const { email, password } = user;
  //   const config = appUrl.auth.login.reqConfig({ email, password });
  //   const res = await appHttp.request<{ data: any }>(config);
  //   accessToken = res.data.data.accessToken;
  //   refreshToken = res.data.data.refreshToken;
  // });

  describe(`${appUrl.user.profile.path} (${appUrl.user.profile.method})`, () => {
    it('should return user profile', async () => {
      const user = await User.createUser();
      const profileRes = await user.profileRaw();

      expect(profileRes.status).toBe(200);

      expect(objSize(profileRes.data)).toBe(1);

      const profile = profileRes.data.data;
      expect(objSize(profile)).toBe(5);

      expect(profile.email).toBe(user.email);
      expect(profile.firstName).toBe(user.firstName);
      expect(profile.lastName).toBe(user.lastName);
      expect(profile.role).toBe('SUBSCRIBER');
      expect(profile.id).toBeDefined();
    });
  });

  describe(`${appUrl.user.delete.path} (${appUrl.user.delete.method})`, () => {
    it('valid response time', async () => {
      const user = await User.createUser();
      const deleteRes = await user.deleteRaw();

      expect(deleteRes.status).toBe(200);
      deleteUserResSchema.parse(deleteRes.data);
    });

    it('deled user should not be able to log in', async () => {
      const user = await User.createUser();
      const profile = await user.profile();
      const deleteRes = await user.deleteRaw();

      expect(deleteRes.data.data.id).toBe(profile.id);

      try {
        await user.login();
        expect(1).toBe(2); // should fail
      } catch (error) {
        expect(error.response.status).toBe(401);
        expect(error.response.data.statusCode).toBe(401);
        expect(error.response.data.error).toBe('UnauthorizedException');
      }
    });
  });
});
