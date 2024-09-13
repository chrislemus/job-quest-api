import { EventHandler } from '@/shared/types';
import { apiError, BuildOpenApiSpecArgOperationObj } from '@/shared';
import { JobDto, JobIdPathParamsDto } from '../dto';
import { authHandler } from '@/features/auth';
import { jobDB } from '@/shared/db/job-db.service';

export const getAJobHandlerSpec: BuildOpenApiSpecArgOperationObj = {
  zodPathParamsSchema: JobIdPathParamsDto,
  responses: {
    200: {
      description: '',
      content: {
        'application/json': {
          zodSchema: { JobDto },
        },
      },
    },
  },
};

export const getAJobHandler: EventHandler = authHandler(
  async (authUser, event) => {
    const res = JobIdPathParamsDto.safeParse(event.pathParameters);
    if (res.error) return apiError(res.error);
    const job = await jobDB.getUnique(authUser.id, res.data.id);

    return {
      statusCode: 200,
      body: JSON.stringify(job),
    };
  },
);
