import { z, ZodEffects, ZodType, ZodTypeAny, ZodTypeDef } from 'zod';
import { appUrl } from './app-urls.const';
import { User } from './mocks/user.mock';
import { objSize } from './utils';

const jobListSchema = z
  .object({
    id: z.string().min(15),
    label: z.string().min(1),
    userId: z.string().min(15),
    order: z.number(),
  })
  .strict();

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

// const createJobListResSchema = z
//   .object({
//     status: z.literal(201),
//     data: z.object({ data: jobListSchema }),
//   })
//   .transform((res) => res.data);
// const getJobListByIdResSchema = z
//   .object({
//     status: z.literal(200),
//     data: z.object({ data: jobListSchema }),
//   })
//   .transform((res) => res.data);
// const updateJobListResSchema = z
//   .object({
//     status: z.literal(200),
//     data: z.object({ data: jobListSchema }),
//   })
//   .transform((res) => res.data);
const createJobListResSchema = buildCommonApiResSchema(201, jobListSchema);
const getJobListByIdResSchema = buildCommonApiResSchema(200, jobListSchema);
const updateJobListResSchema = buildCommonApiResSchema(200, jobListSchema);
const getAllJobListResSchema = buildCommonApiResSchema(
  200,
  z.array(jobListSchema),
);

// const getAllJobListResSchema = z
//   .object({
//     status: z.literal(200),
//     data: z.object({ data: z.array(jobListSchema) }),
//   })
// .transform((res) => res.data);

const zTest = <T1, T2 extends ZodTypeDef, T3, T6 extends ZodType<T1, T2, T3>>(
  _zodEffect: T6,
  data: any,
) => {
  const res = _zodEffect.safeParse(data);
  if (res.error) {
    // const { data, status } = data;
    const errors = {};
    const SchemaErrors = res.error.errors.forEach((_e) => {
      const { path, ...e } = _e;
      const length = path.length;
      path.forEach((key, i) => {
        if (i === length - 1) {
          if (!errors[key]) errors[key] = {};
          let stringVal = '';
          Object.keys(e).forEach((k) => {
            stringVal += `${k}:${e[k]} | `;
          });
          errors[key] = stringVal;
          // errors[key] = e;
        } else {
          errors[key] = {};
        }
      });
      // const { path, ...e } = _e;
      // const returnVal = {
      //   ...e,
      //   path: path.join('.'),
      //   // keys: e?.['keys']?.join('.'),
      // };
      // if (e?.['keys']) returnVal['keys'] = e?.['keys']?.join('.');
      // return returnVal;
    });

    // expect(JSON.stringify({ SchemaErrors })).toEqual(1);
    expect({ data: data?.data, status: data?.status }).toEqual({
      data: { data: errors },
    });
    expect({ data: data?.data, status: data?.status }).toEqual(SchemaErrors);
    // expect({ data: data?.data, status: data?.status }).toEqual(SchemaErrors);

    throw new Error(JSON.stringify({ SchemaErrors }, null, 2));
  }
  if (!res.data) throw new Error(JSON.stringify(res.error));
  return res.data as z.output<T6>;
};

async function createJobList(data: { label: string }, user: User) {
  const config = appUrl.jobList.create.reqConfig(data);
  const resRaw = await user.authFetch(config);
  const res = zTest(createJobListResSchema, resRaw);
  return res.data;
}
async function getAllJobList(user: User) {
  const config = appUrl.jobList.getAll.reqConfig();
  const resRaw = await user.authFetch(config);
  const res = zTest(getAllJobListResSchema, resRaw);
  return res.data;
}
async function getJobListById(jobListsId: string, user: User) {
  const config = appUrl.jobList.getById.reqConfig(jobListsId);
  const resRaw = await user.authFetch(config);
  const res = zTest(getJobListByIdResSchema, resRaw);
  return res.data;
}
async function updateJobList(data: { id: string; label: string }, user: User) {
  const config = appUrl.jobList.update.reqConfig(data);
  const resRaw = await user.authFetch(config);
  const res = zTest(updateJobListResSchema, resRaw);
  return res.data;
}

describe.only('/job-list (e2e)', () => {
  describe(`${appUrl.jobList.create.path} (${appUrl.jobList.create.method})`, () => {
    it('creates job list', async () => {
      const user = await User.createUser();
      const reqBody = { label: 'test' };
      const jobList = await createJobList(reqBody, user);
      expect(jobList.label).toBe(reqBody.label);

      const jobListAll = await getAllJobList(user);
      expect(jobListAll.length).toBe(6);
    });
  });

  describe(`${appUrl.jobList.getAll.path} (${appUrl.jobList.getAll.method})`, () => {
    it('returns all job list (creates 5 default job lists on user signup)', async () => {
      const user = await User.createUser();
      const jobList = await getAllJobList(user);
      expect(jobList.length).toBe(5);

      const labels = new Set([
        'Interview',
        'Queue',
        'Applied',
        'Offer',
        'Rejected',
      ]);
      jobList.forEach((l) => {
        labels.delete(l.label);
      });
      expect(labels.size).toBe(0);
    });
  });

  describe(`${appUrl.jobList.getById.path}/:jobListId (${appUrl.jobList.getById.method})`, () => {
    it('returns job list by id', async () => {
      const user = await User.createUser();
      const jobListNew = await createJobList({ label: 'any' }, user);
      const jobListRes = await getJobListById(jobListNew.id, user);
      expect(jobListNew).toEqual(jobListRes);
    });
  });

  describe(`${appUrl.jobList.update.path}/:jobListId (${appUrl.jobList.update.method})`, () => {
    it('updates job list item', async () => {
      const user = await User.createUser();
      const [jobList] = await getAllJobList(user);

      const data = { id: jobList.id, label: 'new label' };
      const jobListRes = await updateJobList(data, user);
      expect(data).toBe(1);

      // expect(jobListRes.id).toEqual(id);
      // expect(jobListRes.label).toEqual(label);
    });
  });

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
