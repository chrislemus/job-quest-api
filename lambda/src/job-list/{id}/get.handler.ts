import { EventHandler } from '@/common/types';
import {
  apiError,
  BuildOpenApiSpecArgOperationObj,
  notFoundException,
} from '../../common';
import { jobListSchema } from './schemas';
import { jobListIdPathParamsSchema } from './schemas';
import { jobListDB } from '@/db/job-list-db.service';
import { authHandler } from '@/auth';

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
    404: { description: '' },
  },
};

export const handler: EventHandler = authHandler(async (authUser, event) => {
  const res = jobListIdPathParamsSchema.safeParse(event.pathParameters);
  if (res.error) return apiError(res.error);

  const jobList = await jobListDB.queryUnique(authUser.id, res.data.id);
  if (!jobList) throw notFoundException();

  const body = jobListSchema.parse(jobList);
  return {
    statusCode: 200,
    body: JSON.stringify(body),
  };
});
