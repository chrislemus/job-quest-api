import { apiError, BuildOpenApiSpecArgOperationObj } from '../common';
import { EventHandler } from '../common/types';
import { getJobsQueryParamsSchema, jobPageResSchema } from './schemas';
import { jobDB } from '@/db/job-db.service';
import { authHandler } from '@/auth';

export const openapi: BuildOpenApiSpecArgOperationObj = {
  zodQueryParamsSchema: getJobsQueryParamsSchema,
  responses: {
    200: {
      description: '',
      content: {
        'application/json': {
          zodSchema: jobPageResSchema,
        },
      },
    },
  },
};

export const handler: EventHandler = authHandler(async (authUser, event) => {
  const res = getJobsQueryParamsSchema.safeParse(event.queryStringParameters);
  if (res.error) return apiError(res.error);
  if (res.data.jobListId) throw new Error('jobListId is not implemented yet');

  const { Items } = await jobDB.findAll(authUser.id);
  const items = !Items ? [] : Items;

  return {
    statusCode: 200,
    body: JSON.stringify({ items }),
  };
});
