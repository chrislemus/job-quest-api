import { EventHandler } from '@/common/types';
import {
  apiError,
  badRequestException,
  BuildOpenApiSpecArgOperationObj,
} from '@/common';
import { jobSchema } from '../schemas';
import { jobIdPathParamsSchema, updateJobSchema } from './schemas';
import { authHandler } from '@/auth';
import { jobDB } from '@/db/job-db.service';
import { jobListDataUtil } from '../job-list-data.util';

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
  requestBody: {
    required: true,
    content: {
      'application/json': {
        zodSchema: { updateJobSchema },
      },
    },
  },
};

export const handler: EventHandler = authHandler(async (authUser, event) => {
  const pathParams = jobIdPathParamsSchema.safeParse(event.pathParameters);
  if (pathParams.error) return apiError(pathParams.error);
  const body = updateJobSchema.safeParse(JSON.parse(event.body || '{}'));
  if (body.error) return apiError(body.error);
  const jobId = pathParams.data.id;
  const userId = authUser.id;
  const { jobListId, jobListRank, ...jobData } = body.data;

  const jobListUpdates = jobListId
    ? await jobListDataUtil.getJobListData(authUser.id, jobListId, jobListRank)
    : {};

  await jobDB.update({
    userId,
    id: jobId,
    ...jobData,
    ...jobListUpdates,
  });

  const job = await jobDB.getUnique(userId, jobId);

  return {
    statusCode: 200,
    body: JSON.stringify(job),
  };
});
