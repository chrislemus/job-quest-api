import { authHandler } from '@/features/auth';
import { EventHandler } from '@/shared/types';
import { CreateAJobLogDto } from '../dto';
import { JobLogEntity } from '../entities';
import { jobLogDB } from '@/shared/db/job-log-db.service';
import {
  apiError,
  BuildOpenApiSpecArgOperationObj,
  internalServerException,
} from '@/shared';

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
    const { authUser } = ctx;
    const res = CreateAJobLogDto.safeParse(JSON.parse(req.body || '{}'));
    if (res.error) return apiError(res.error);
    const reqBody = res.data;

    const jobLog = await jobLogDB.create(authUser.id, reqBody);

    if (!jobLog) throw internalServerException();

    return {
      status: 200,
      body: jobLog,
    };
  },
);
