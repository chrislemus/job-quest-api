import { authHandler } from '@/auth';
import { apiError, BuildOpenApiSpecArgOperationObj } from '@/common';
import { EventHandler } from '@/common/types';
import { createJobListSchema, jobListSchema } from './schemas';
import { jobListDB } from '@/db/job-list-db.service';

export const openapi: BuildOpenApiSpecArgOperationObj = {
  responses: {
    201: {
      description: '',
      content: {
        'application/json': {
          zodSchema: { jobListSchema },
        },
      },
    },
  },
  requestBody: {
    required: true,
    content: {
      'application/json': {
        zodSchema: { createJobListSchema },
      },
    },
  },
};

export const handler: EventHandler = authHandler(async (authUser, event) => {
  const res = createJobListSchema.safeParse(JSON.parse(event.body || '{}'));
  if (res.error) return apiError(res.error);

  const { label } = res.data;

  const jobList = await jobListDB.create({
    userId: authUser.id,
    label,
  });

  const body = jobListSchema.parse(jobList);
  return {
    statusCode: 201,
    body: JSON.stringify(body),
  };
  // return {
  //   statusCode: 200,
  //   body: JSON.stringify({ event, custom: 'GETSignuphandler' }),
  // };
});
