import { z } from 'zod';
import { User } from './mocks/user.mock';
import { appUrl } from './utils';

const deleteUserResSchema = z
  .object({
    data: z.object({
      id: z.string().min(15),
    }),
  })
  .strict();

const userProfileResSchema = z
  .object({
    id: z.string().min(15),
    email: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    role: z.enum(['SUBSCRIBER', 'ADMIN']),
  })
  .strict();

describe('/user (e2e)', () => {
  describe(`${appUrl.user.profile.path} (${appUrl.user.profile.method})`, () => {
    it('should return user profile', async () => {
      const user = await User.createUser();
      const profileRes = await user.profileRaw();
      expect(profileRes.status).toBe(200);
      userProfileResSchema.parse(profileRes.data);
    });
  });

  describe(`${appUrl.user.delete.path} (${appUrl.user.delete.method})`, () => {
    it('valid response type', async () => {
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
      } catch (_error) {
        const error = JSON.parse(_error);
        expect(error.status).toBe(401);
        expect(error.data.statusCode).toBe(401);
        expect(error.data.error).toBe('UnauthorizedException');
      }
    });
  });
});
