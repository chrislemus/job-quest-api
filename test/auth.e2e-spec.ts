import { User } from './mocks/user.mock';
import { appUrl } from './app-urls.const';
import { objSize } from './utils';

describe('/auth (e2e)', () => {
  describe(`${appUrl.auth.signup.path} (${appUrl.auth.signup.method})`, () => {
    it('should create a new user', async () => {
      const { createUserRes } = await User.createUser();

      expect(createUserRes.status).toBe(201);

      expect(objSize(createUserRes.data)).toBe(1); // no additional keys

      const { data } = createUserRes.data;
      expect(objSize(data)).toBe(2); // no additional keys

      const { accessToken, refreshToken } = data;

      expect(accessToken.length).toBeGreaterThan(10);
      expect(refreshToken.length).toBeGreaterThan(10);
      expect(accessToken).not.toEqual(refreshToken);
    });
  });

  describe(`${appUrl.auth.login.path} (${appUrl.auth.login.method})`, () => {
    it('should login user and provide new set of tokens', async () => {
      const user = await User.createUser();
      const accessTokenOld = user.jwt.accessToken;
      const refreshTokenOld = user.jwt.refreshToken;

      const loginRes = await user.loginRaw();

      expect(loginRes.status).toBe(201);
      expect(objSize(loginRes.data)).toBe(1); // no additional
      expect(objSize(loginRes.data.data)).toBe(2); // no additional
      const { accessToken, refreshToken } = loginRes.data.data;

      expect(accessToken?.length).toBeGreaterThan(10);
      expect(refreshToken?.length).toBeGreaterThan(10);
      expect(accessToken).not.toEqual(refreshToken);

      expect(accessToken).not.toEqual(accessTokenOld);
      expect(refreshToken).not.toEqual(refreshTokenOld);
    });
  });

  describe(`${appUrl.auth.refresh.path} (${appUrl.auth.refresh.method})`, () => {
    it('should refresh token', async () => {
      const user = await User.createUser();
      const { accessToken, refreshToken } = user.jwt;

      const refreshRes = await user.refreshJwt();
      expect(objSize(refreshRes.data)).toBe(1); // no additional
      expect(objSize(refreshRes.data.data)).toBe(2); // no additional

      const newAccessToken = refreshRes.data.data.accessToken;
      const newRefreshToken = refreshRes.data.data.refreshToken;

      expect(newRefreshToken).not.toEqual(refreshToken);
      expect(newAccessToken).not.toEqual(accessToken);
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
