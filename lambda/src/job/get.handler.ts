import { apiError, BuildOpenApiSpecArgOperationObj } from '../common';
import { EventHandler } from '../common/types';
import { getJobsQueryParamsSchema, jobPageResSchema } from './schemas';
import { Job, jobDB } from '@/db/job-db.service';
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
  let items: Job[] = [];

  if (res.data.jobListId) {
    const jobs = await jobDB.findAllByJobListId(
      authUser.id,
      res.data.jobListId,
    );
    if (jobs) items = jobs;
    // throw new Error('jobListId is not implemented yet');
  } else {
    const { Items } = await jobDB.findAll(authUser.id);
    if (Items) items = Items;
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ items }),
  };
});
