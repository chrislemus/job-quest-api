import { z, ZodType, ZodTypeAny, ZodTypeDef } from 'zod';
import { appUrl } from './app-urls.const';
import { User } from './mocks/user.mock';
import { createJobList, getAllJobList } from './job-list.e2e-spec';

function buildCommonApiResSchema<
  T1,
  T2 extends ZodTypeDef,
  T3,
  T6 extends ZodType<T1, T2, T3>,
>(statusCode: number, dataSchema: T6) {
  return z
    .object({
      status: z.literal(statusCode),
      data: z.object({
        data: dataSchema,
      }),
    })
    .transform((res) => res.data as { data: z.output<T6> });
}

async function createJob(
  data: {
    userId: string;
    jobListId: string;
    title: string;
    company: string;
    location?: string;
    url?: string;
    salary?: string;
    description?: string;
    color?: string;
  },
  user: User,
) {
  const config = appUrl.job.create.reqConfig(data);
  const resRaw = await user.authFetch(config);
  return resRaw;
  // const res = zTest(createJobListResSchema, resRaw);
  // return res.data;
}

describe.only('/job (e2e)', () => {
  describe(`${appUrl.job.create.path} (${appUrl.job.create.method})`, () => {
    it('creates job list', async () => {
      const user = await User.createUser();
      const userProfile = await user.profile();
      // const reqBody = { label: 'test' };
      const jobList = await getAllJobList(user);
      console.log(jobList);
      const job = await createJob(
        {
          userId: userProfile.id,
          jobListId: jobList[0].id,
          title: 'janitor',
          company: 'google',
        },
        user,
      );
      expect(job).toBe(1);
    });
  });

  // describe(`${appUrl.jobList.delete.path}/:jobListId (${appUrl.jobList.delete.method})`, () => {
  //   it('deletes job list item', async () => {
  //     const user = await User.createUser();
  //     const jobList = await getAllJobList(user);
  //     const jobListDeleteId = jobList[2].id;

  //     const data = { id: jobList.id, label: 'new label' };
  //     const jobListRes = await updateJobList(data, user);
  //     expect(jobListRes.label).toBe(data.label);
  //     expect(jobListRes.id).toBe(data.id);
  //     expect(jobListRes.userId).toBe(userProfile.id);
  //   });
  // });

  // describe(`${appUrl.user.delete.path} (${appUrl.user.delete.method})`, () => {
  //   it('valid response type', async () => {
  //     const user = await User.createUser();
  //     const deleteRes = await user.deleteRaw();

  //     expect(deleteRes.status).toBe(200);
  //     deleteUserResSchema.parse(deleteRes.data);
  //   });

  //   it('deled user should not be able to log in', async () => {
  //     const user = await User.createUser();
  //     const profile = await user.profile();
  //     const deleteRes = await user.deleteRaw();

  //     expect(deleteRes.data.data.id).toBe(profile.id);

  //     try {
  //       await user.login();
  //       expect(1).toBe(2); // should fail
  //     } catch (error) {
  //       expect(error.response.status).toBe(401);
  //       expect(error.response.data.statusCode).toBe(401);
  //       expect(error.response.data.error).toBe('UnauthorizedException');
  //     }
  //   });
  // });
});
