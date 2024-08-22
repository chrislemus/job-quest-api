import { EventHandler } from '@/common/types';
import { apiError, BuildOpenApiSpecArgOperationObj } from '../../common';
import { jobListSchema, updateJobListSchema } from './schemas';
import { jobListIdPathParamsSchema } from './schemas';
import { authHandler } from '@/auth';
import { jobListDB } from '@/db/job-list-db.service';

export const openapi: BuildOpenApiSpecArgOperationObj = {
  zodPathParamsSchema: jobListIdPathParamsSchema,
  responses: {
    200: {
      description: '',
      content: {
        'application/json': {
          zodSchema: { jobListSchema },
        },
      },
    },
    400: { description: 'Bad Request' },
  },
  requestBody: {
    required: true,
    content: {
      'application/json': {
        zodSchema: { updateJobListSchema },
      },
    },
  },
};

export const handler: EventHandler = authHandler(async (authUser, event) => {
  const res = jobListIdPathParamsSchema.safeParse(event.pathParameters);
  if (res.error) return apiError(res.error);
  const jobListId = res.data.id;

  const res2 = updateJobListSchema.safeParse(JSON.parse(event.body || '{}'));
  if (res2.error) return apiError(res2.error);
  const { label } = res2.data;

  const jobList = await jobListDB.update({
    id: jobListId,
    userId: authUser.id,
    label,
  });

  const body = jobListSchema.parse(jobList);
  return {
    statusCode: 200,
    body: JSON.stringify(body),
  };
});
