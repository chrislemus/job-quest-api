import { jobListDB } from '@/db/job-list-db.service';
import { BuildOpenApiSpecArgOperationObj } from '../common';
import { EventHandler } from '../common/types';
import { getJobListsQueryParamsSchema, jobListPageResSchema } from './schemas';
import { authHandler } from '@/auth';

export const openapi: BuildOpenApiSpecArgOperationObj = {
  zodQueryParamsSchema: getJobListsQueryParamsSchema,
  responses: {
    200: {
      description: '',
      content: {
        'application/json': {
          zodSchema: jobListPageResSchema,
        },
      },
    },
  },
};

export const handler: EventHandler = authHandler(async (authUser, event) => {
  const data = await jobListDB.findAll(authUser.id);

  const body = JSON.stringify({
    data,
    pageInfo: {
      currentPage: 0,
      currentPageSize: 0,
      currentPageCount: 0,
    },
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ event, custom: 'GETSignuphandler' }),
  };
});
