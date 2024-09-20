import { EventHandler } from '@/shared/types';
import { apiError, BuildOpenApiSpecArgOperationObj } from '@/shared';
import { authHandler } from '@/features/auth';
import { GetAJobLogPathParamsDto } from '../dto';
import { JobLogEntity } from '../entities';
import { jobLogDB } from '@/shared/db/job-log-db.service';

export const getAJobLogHandlerSpec: BuildOpenApiSpecArgOperationObj = {
  zodPathParamsSchema: GetAJobLogPathParamsDto,
  responses: {
    200: {
      description: '',
      content: {
        'application/json': {
          zodSchema: { JobLogEntity },
        },
      },
    },
  },
};

export const getAJobLogHandler: EventHandler = authHandler(
  async (authUser, event) => {
    const res = GetAJobLogPathParamsDto.safeParse(event.pathParameters);
    if (res.error) return apiError(res.error);
    const jobLog = await jobLogDB.getUnique(authUser.id, res.data.id);
    console.log({ jobLog });
    const resBody = JobLogEntity.parse(jobLog);
    console.log({ resBody });
    return {
      statusCode: 200,
      body: JSON.stringify(resBody),
    };
  },
);
