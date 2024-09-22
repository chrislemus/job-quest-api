import { jobListDB } from '@/shared/db/job-list-db.service';
import { BuildOpenApiSpecArgOperationObj } from '@/shared';
import { EventHandler } from '@/shared/types';
import { GetJobListsQueryParamsDto, JobListPageResDto } from '../dto';
import { authHandler } from '@/features/auth';

export const getJobListHandlerSpec: BuildOpenApiSpecArgOperationObj = {
  zodQueryParamsSchema: GetJobListsQueryParamsDto,
  responses: {
    200: {
      description: '',
      content: {
        'application/json': {
          zodSchema: JobListPageResDto,
        },
      },
    },
  },
};

export const getJobListHandler: EventHandler = authHandler(async (req, ctx) => {
  const { authUser } = ctx;
  const items = await jobListDB.findAll(authUser.id);

  const body = {
    items,
    pageInfo: {
      currentPage: 0,
      currentPageSize: 0,
      currentPageCount: 0,
    },
  };

  return {
    status: 200,
    body: body,
  };
});
