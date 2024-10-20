import { apiParse, BuildOpenApiSpecArgOperationObj } from '@/shared';
import { EventHandler } from '@/shared/types';
import { authHandler } from '@/features/auth';
import { GetJobLogsQueryParamsDto, JobLogPageResDto } from '../dto';
import { JobQuestDBService } from '@/core/database';

export const getJobLogsHandlerSpec: BuildOpenApiSpecArgOperationObj = {
  zodQueryParamsSchema: GetJobLogsQueryParamsDto,
  responses: {
    200: {
      description: '',
      content: {
        'application/json': {
          zodSchema: JobLogPageResDto,
        },
      },
    },
  },
};

export const getJobLogsHandler: EventHandler = authHandler(async (req, ctx) => {
  const queryParams = await apiParse(GetJobLogsQueryParamsDto, req.queryParams);

  const dbRes = await JobQuestDBService.entities.jobLog.query
    .jobLogByJobId({ jobId: queryParams.jobId })
    .go();

  return {
    status: 200,
    body: { items: dbRes.data },
  };
});
