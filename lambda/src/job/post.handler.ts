import { authHandler } from '@/auth';
import {
  apiError,
  BuildOpenApiSpecArgOperationObj,
  internalServerException,
} from '../common';
import { EventHandler } from '../common/types';
import { createJobSchema, jobSchema } from './schemas';
import { jobListDataUtil } from './job-list-data.util';
import { jobDB } from '@/db/job-db.service';

export const openapi: BuildOpenApiSpecArgOperationObj = {
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
        zodSchema: { createJobSchema },
      },
    },
  },
};

export const handler: EventHandler = authHandler(
  async (authUser, event, ctx) => {
    const res = createJobSchema.safeParse(JSON.parse(event.body || '{}'));
    if (res.error) return apiError(res.error);
    const reqBody = res.data;

    const { jobListId, jobListRank, ...jobData } = reqBody;

    const jobListUpdates = await jobListDataUtil.getJobListData(
      authUser.id,
      jobListId,
      jobListRank,
    );

    const job = await jobDB.create({
      userId: authUser.id,
      ...jobData,
      ...jobListUpdates,
    });

    if (!job) throw internalServerException();

    const body = jobSchema.parse(job);
    // const
    return {
      statusCode: 200,
      body: JSON.stringify(body),
    };
  },
);
