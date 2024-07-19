import { User } from './mocks/user.mock';
import { appUrl } from './app-urls.const';
import { z } from 'zod';

const jwtSchema = z
  .object({
    accessToken: z.string().min(10),
    refreshToken: z.string().min(10),
  })
  .strict()
  .refine((jwt) => jwt.accessToken !== jwt.refreshToken, {
    message: 'Access and refresh tokens should not be the same',
  });

const jwtPayloadSchema = z
  .object({ data: jwtSchema })
  .strict()
  .transform((data) => data.data);

describe.skip('/auth (e2e)', () => {
  describe(`${appUrl.auth.signup.path} (${appUrl.auth.signup.method})`, () => {
    it('should create a new user', async () => {
      const { createUserRes } = await User.createUser();

      expect(createUserRes.status).toBe(201);
      jwtPayloadSchema.parse(createUserRes.data);
    });
    // it.only('should create default job lists on signup', async () => {
    //   const user = await User.createUser();

    //   expect(createUserRes.status).toBe(201);
    //   jwtPayloadSchema.parse(createUserRes.data);
    // });
  });

  describe(`${appUrl.auth.login.path} (${appUrl.auth.login.method})`, () => {
    it('should login user and provide new set of tokens', async () => {
      const user = await User.createUser();
      const accessTokenOld = user.jwt.accessToken;
      const refreshTokenOld = user.jwt.refreshToken;

      const loginRes = await user.loginRaw();
      expect(loginRes.status).toBe(201);
      const { accessToken, refreshToken } = jwtPayloadSchema.parse(
        loginRes.data,
      );

      expect(accessToken).not.toEqual(accessTokenOld);
      expect(refreshToken).not.toEqual(refreshTokenOld);
    });
  });

  describe(`${appUrl.auth.refresh.path} (${appUrl.auth.refresh.method})`, () => {
    it('should refresh token', async () => {
      const user = await User.createUser();
      const oldAccessToken = user.jwt.accessToken;
      const oldRefreshToken = user.jwt.refreshToken;

      const refreshRes = await user.refreshJwt();
      expect(refreshRes.status).toBe(201);
      const { accessToken, refreshToken } = jwtPayloadSchema.parse(
        refreshRes.data,
      );

      expect(refreshToken).not.toEqual(oldRefreshToken);
      expect(accessToken).not.toEqual(oldAccessToken);
    });

    it('new tokens should work', async () => {
      const user = await User.createUser();
      await user.refreshJwt();
      const profile = await user.profile();
      expect(user.email).toBe(profile.email);
    });
  });

  describe(`${appUrl.auth.logout.path} (${appUrl.auth.logout.method})`, () => {
    it('should logout user', async () => {
      const user = await User.createUser();
      const logoutRes = await user.logout();

      expect(logoutRes.status).toBe(200);
      expect(logoutRes.data).toEqual({ data: true });
    });
  });
});
