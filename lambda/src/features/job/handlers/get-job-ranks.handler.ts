import { apiParse, BuildOpenApiSpecArgOperationObj } from '@/shared';
import { EventHandler } from '@/shared/types';
import { GetJobRanksQueryParamsDto, JobRanksPageResDto } from '../dto';
import { authHandler } from '@/features/auth';
import { JobQuestDBService } from '@/core/database';

export const getJobRanksHandlerSpec: BuildOpenApiSpecArgOperationObj = {
  zodQueryParamsSchema: GetJobRanksQueryParamsDto,
  responses: {
    200: {
      description: '',
      content: {
        'application/json': {
          zodSchema: JobRanksPageResDto,
        },
      },
    },
  },
};

export const getJobRanksHandler: EventHandler = authHandler(
  async (req, ctx) => {
    const userId = ctx.authUser.id;
    const queryParams = await apiParse(
      GetJobRanksQueryParamsDto,
      req.queryParams,
    );

    const jobListId = queryParams.jobListId;

    const { data: jobRanks } = await JobQuestDBService.entities.jobRank.query
      .jobRank({
        userId,
        jobListId,
      })
      .go();

    return {
      status: 200,
      body: { items: jobRanks },
    };
  },
);
