import { apiError, BuildOpenApiSpecArgOperationObj } from '@/shared';
import { EventHandler } from '@/shared/types';
// import { GetJobsQueryParamsDto, JobPageResDto } from '../dto';
import { Job, jobDB } from '@/shared/db/job-db.service';
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

export const getJobLogsHandler: EventHandler = authHandler(async (authUser) => {
  // const res = GetJobsQueryParamsDto.safeParse(event.queryStringParameters);
  // if (res.error) return apiError(res.error);
  const items: JobLogEntity[] = await jobLogDB.findAll(authUser.id);

  return {
    statusCode: 200,
    body: JSON.stringify({ items }),
  };
});
