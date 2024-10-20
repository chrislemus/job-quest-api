import { BuildOpenApiSpecArgOperationObj } from '@/shared';
import { EventHandler } from '@/shared/types';
import { GetJobListsQueryParamsDto, JobListPageResDto } from '../dto';
import { authHandler } from '@/features/auth';
import { JobQuestDBService } from '@/core/database';

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
  const { data: items } = await JobQuestDBService.entities.jobList.query
    .jobList({ userId: authUser.id })
    .go({ pages: 'all' });

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
