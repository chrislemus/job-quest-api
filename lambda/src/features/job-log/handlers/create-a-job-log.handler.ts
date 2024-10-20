import { authHandler } from '@/features/auth';
import { EventHandler } from '@/shared/types';
import { CreateAJobLogDto } from '../dto';
import { JobLogEntity } from '../entities';
import {
  apiParse,
  BuildOpenApiSpecArgOperationObj,
  internalServerException,
  uuid,
} from '@/shared';
import { JobQuestDBService } from '@/core/database';

export const createAJobLogHandlerSpec: BuildOpenApiSpecArgOperationObj = {
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
  requestBody: {
    required: true,
    content: {
      'application/json': {
        zodSchema: { CreateAJobLogDto },
      },
    },
  },
};

export const createAJobLogHandler: EventHandler = authHandler(
  async (req, ctx) => {
    const userId = ctx.authUser.id;
    const reqBody = await apiParse(CreateAJobLogDto, req.body);

    const jobLogId = uuid();
    await JobQuestDBService.transaction
      .write((e) => {
        return [
          e.jobLog.create({ ...reqBody, jobLogId, userId }).commit(),
          e.job
            .check({ userId, jobId: reqBody.jobId })
            .where((attr, op) => op.eq(attr.userId, userId))
            .commit(),
        ];
      })
      .go();

    const { data: jobLog } = await JobQuestDBService.entities.jobLog
      .get({
        jobLogId,
        userId,
      })
      .go();

    if (!jobLog) throw internalServerException();

    return {
      status: 200,
      body: jobLog,
    };
  },
);
