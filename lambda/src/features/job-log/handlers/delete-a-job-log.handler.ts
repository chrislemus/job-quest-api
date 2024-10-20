import { EventHandler } from '@/shared/types';
import { apiParse, BuildOpenApiSpecArgOperationObj } from '@/shared';
import { authHandler } from '@/features/auth';
import { DeleteAJobLogPathParamsDto } from '../dto';
import { JobQuestDBService } from '@/core/database';

export const deleteAJobLogHandlerSpec: BuildOpenApiSpecArgOperationObj = {
  zodPathParamsSchema: DeleteAJobLogPathParamsDto,
  responses: {
    200: {
      description: '',
    },
  },
};

export const deleteAJobLogHandler: EventHandler = authHandler(
  async (req, ctx) => {
    const userId = ctx.authUser.id;
    const pathParams = await apiParse(
      DeleteAJobLogPathParamsDto,
      req.pathParams,
    );

    const { id: jobLogId } = pathParams;

    await JobQuestDBService.entities.jobLog.delete({ jobLogId, userId }).go();

    return {
      status: 200,
    };
  },
);
