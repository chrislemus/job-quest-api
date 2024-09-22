import { BuildOpenApiSpecArgOperationObj } from '@/shared';
import { EventHandler } from '@/shared/types';
import { authHandler } from '@/features/auth';
import { JobLogPageResDto } from '../dto';
import { jobLogDB } from '@/shared/db/job-log-db.service';
import { JobLogEntity } from '../entities';

export const getJobLogsHandlerSpec: BuildOpenApiSpecArgOperationObj = {
  // zodQueryParamsSchema: GetJobsQueryParamsDto,
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
  const { authUser } = ctx;
  // const res = GetJobsQueryParamsDto.safeParse(event.queryStringParameters);
  // if (res.error) return apiError(res.error);
  const items: JobLogEntity[] = await jobLogDB.findAll(authUser.id);

  return {
    status: 200,
    body: { items },
  };
});
