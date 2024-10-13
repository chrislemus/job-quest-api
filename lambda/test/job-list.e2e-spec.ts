// import { z } from 'zod';
// import { appUrl, buildCommonApiResSchema, zTest } from './utils';
// import { User } from './mocks/user.mock';

// const jobListSchema = z
//   .object({
//     id: z.string().min(15),
//     label: z.string().min(1),
//     userId: z.string().min(15),
//     order: z.number(),
//   })
//   .strict();

// const createJobListResSchema = buildCommonApiResSchema(201, jobListSchema);
// const getJobListByIdResSchema = buildCommonApiResSchema(200, jobListSchema);
// const updateJobListResSchema = buildCommonApiResSchema(200, jobListSchema);
// const getAllJobListResSchema = buildCommonApiResSchema(
//   200,
//   z.array(jobListSchema),
// );

// // const getAllJobListResSchema = z
// //   .object({
// //     status: z.literal(200),
// //     data: z.object({ data: z.array(jobListSchema) }),
// //   })
// // .transform((res) => res.data);

// export async function createJobList(data: { label: string }, user: User) {
//   const config = appUrl.jobList.create.reqConfig(data);
//   const resRaw = await user.authFetch(config);
//   const res = zTest(createJobListResSchema, resRaw);
//   return res.data;
// }
// export async function getAllJobList(user: User) {
//   const config = appUrl.jobList.getAll.reqConfig();
//   const resRaw = await user.authFetch(config);
//   const res = zTest(getAllJobListResSchema, resRaw);
//   return res.data;
// }
// async function getJobListById(jobListsId: string, user: User) {
//   const config = appUrl.jobList.getById.reqConfig(jobListsId);
//   const resRaw = await user.authFetch(config);
//   const res = zTest(getJobListByIdResSchema, resRaw);
//   return res.data;
// }
// async function updateJobList(data: { id: string; label: string }, user: User) {
//   const config = appUrl.jobList.update.reqConfig(data);
//   const resRaw = await user.authFetch(config);
//   const res = zTest(updateJobListResSchema, resRaw);
//   return res.data;
// }
// async function deleteJobList(jobListId: string, user: User) {
//   const config = appUrl.jobList.delete.reqConfig(jobListId);
//   const resRaw = await user.authFetch(config);
//   const res = zTest(updateJobListResSchema, resRaw);
//   return res.data;
// }

// describe('/job-list (e2e)', () => {
//   describe(`${appUrl.jobList.create.path} (${appUrl.jobList.create.method})`, () => {
//     it('creates job list', async () => {
//       const user = await User.createUser();
//       const reqBody = { label: 'test' };
//       const jobList = await createJobList(reqBody, user);
//       expect(jobList.label).toBe(reqBody.label);

//       const jobListAll = await getAllJobList(user);
//       expect(jobListAll.length).toBe(6);
//     });
//     it('job list limit check', async () => {
//       // todo: implement
//       // todo: implement
//       // todo: implement
//       // todo: implement
//       // todo: implement
//       // todo: implement
//       // todo: implement
//       // todo: implement
//       // todo: implement
//       // todo: implement
//       // todo: implement
//       // todo: implement
//       // todo: implement
//       // todo: implement
//       // todo: implement
//       // todo: implement
//       // todo: implement
//       // todo: implement
//       // todo: implement
//       // todo: implement
//       // todo: implement
//       // todo: implement
//       // todo: implement
//       // todo: implement
//       // todo: implement
//       // todo: implement
//       // todo: implement
//       // todo: implement
//       // todo: implement
//       // todo: implement
//       // todo: implement
//       // todo: implement
//       // todo: implement
//       // todo: implement
//       // todo: implement
//       // todo: implement
//       // todo: implement
//       // todo: implement
//       // todo: implement
//       // todo: implement
//       // todo: implement
//       // todo: implement
//       // todo: implement
//       // todo: implement
//     });
//   });

//   describe(`${appUrl.jobList.getAll.path} (${appUrl.jobList.getAll.method})`, () => {
//     it('returns all job list (creates 5 default job lists on user signup)', async () => {
//       const user = await User.createUser();
//       const jobList = await getAllJobList(user);
//       expect(jobList.length).toBe(5);

//       const labels = new Set([
//         'Interview',
//         'Queue',
//         'Applied',
//         'Offer',
//         'Rejected',
//       ]);
//       jobList.forEach((l) => {
//         labels.delete(l.label);
//       });
//       expect(labels.size).toBe(0);
//     });
//   });

//   describe(`${appUrl.jobList.getById.path}/:jobListId (${appUrl.jobList.getById.method})`, () => {
//     it('returns job list by id', async () => {
//       const user = await User.createUser();
//       const jobListNew = await createJobList({ label: 'any' }, user);
//       const jobListRes = await getJobListById(jobListNew.id, user);
//       expect(jobListNew).toEqual(jobListRes);
//     });
//   });

//   describe(`${appUrl.jobList.update.path}/:jobListId (${appUrl.jobList.update.method})`, () => {
//     it('updates job list item', async () => {
//       const user = await User.createUser();
//       const userProfile = await user.profile();
//       const [jobList] = await getAllJobList(user);

//       const data = { id: jobList.id, label: 'new label' };
//       const jobListRes = await updateJobList(data, user);
//       expect(jobListRes.label).toBe(data.label);
//       expect(jobListRes.id).toBe(data.id);
//       expect(jobListRes.userId).toBe(userProfile.id);
//     });
//   });

//   // describe(`${appUrl.jobList.delete.path}/:jobListId (${appUrl.jobList.delete.method})`, () => {
//   //   it('deletes job list item', async () => {
//   //     const user = await User.createUser();
//   //     const jobList = await getAllJobList(user);
//   //     const jobListDeleteId = jobList[2].id;

//   //     const data = { id: jobList.id, label: 'new label' };
//   //     const jobListRes = await updateJobList(data, user);
//   //     expect(jobListRes.label).toBe(data.label);
//   //     expect(jobListRes.id).toBe(data.id);
//   //     expect(jobListRes.userId).toBe(userProfile.id);
//   //   });
//   // });

//   // describe(`${appUrl.user.delete.path} (${appUrl.user.delete.method})`, () => {
//   //   it('valid response type', async () => {
//   //     const user = await User.createUser();
//   //     const deleteRes = await user.deleteRaw();

//   //     expect(deleteRes.status).toBe(200);
//   //     deleteUserResSchema.parse(deleteRes.data);
//   //   });

//   //   it('deled user should not be able to log in', async () => {
//   //     const user = await User.createUser();
//   //     const profile = await user.profile();
//   //     const deleteRes = await user.deleteRaw();

//   //     expect(deleteRes.data.data.id).toBe(profile.id);

//   //     try {
//   //       await user.login();
//   //       expect(1).toBe(2); // should fail
//   //     } catch (error) {
//   //       expect(error.response.status).toBe(401);
//   //       expect(error.response.data.statusCode).toBe(401);
//   //       expect(error.response.data.error).toBe('UnauthorizedException');
//   //     }
//   //   });
//   // });
// });
