import { EventHandler } from '@/shared/types';
import { JobDto, JobIdPathParamsDto } from '../dto';
import { authHandler } from '@/features/auth';
import { JobQuestDBService } from '@/core/database';
import {
  apiParse,
  BuildOpenApiSpecArgOperationObj,
  notFoundException,
} from '@/shared';

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

export const getAJobHandler: EventHandler = authHandler(async (req, ctx) => {
  const userId = ctx.authUser.id;
  const pathParams = await apiParse(JobIdPathParamsDto, req.pathParams);

  const jobId = pathParams.id;

  const { data: job } = await JobQuestDBService.entities.job
    .get({ userId, jobId })
    .go();
  if (!job) throw notFoundException('Job not found');

  return {
    status: 200,
    body: job,
  };
});
