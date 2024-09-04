import { EventHandler } from '@/common/types';
import { apiError, BuildOpenApiSpecArgOperationObj } from '@/common';
import { jobSchema } from '../schemas';
import { jobIdPathParamsSchema } from './schemas';
import { authHandler } from '@/auth';
import { jobDB } from '@/db/job-db.service';

export const openapi: BuildOpenApiSpecArgOperationObj = {
  zodPathParamsSchema: jobIdPathParamsSchema,
  responses: {
    200: {
      description: '',
      content: {
        'application/json': {
          zodSchema: { jobSchema },
        },
      },
    },
  },
};

export const handler: EventHandler = authHandler(async (authUser, event) => {
  const res = jobIdPathParamsSchema.safeParse(event.pathParameters);
  if (res.error) return apiError(res.error);
  const job = await jobDB.getUnique(authUser.id, res.data.id);

  return {
    statusCode: 200,
    body: JSON.stringify(job),
  };
});
