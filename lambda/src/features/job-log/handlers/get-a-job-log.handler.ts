import { EventHandler } from '@/shared/types';
import {
  apiParse,
  BuildOpenApiSpecArgOperationObj,
  notFoundException,
} from '@/shared';
import { authHandler } from '@/features/auth';
import { GetAJobLogPathParamsDto } from '../dto';
import { JobLogEntity } from '../entities';
import { JobQuestDBService } from '@/core/database';

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

export const getAJobLogHandler: EventHandler = authHandler(async (req, ctx) => {
  const userId = ctx.authUser.id;
  const pathParams = await apiParse(GetAJobLogPathParamsDto, req.pathParams);

  const { data: jobLog } = await JobQuestDBService.entities.jobLog
    .get({
      jobLogId: pathParams.id,
      userId,
    })
    .go();

  if (!jobLog) return notFoundException('Job log not found');

  return {
    status: 200,
    body: jobLog,
  };
});
