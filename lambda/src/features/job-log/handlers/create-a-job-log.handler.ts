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
  async (authUser, event) => {
    const res = CreateAJobLogDto.safeParse(JSON.parse(event.body || '{}'));
    if (res.error) return apiError(res.error);
    const reqBody = res.data;

    const jobLog = await jobLogDB.create(authUser.id, reqBody);

    if (!jobLog) throw internalServerException();
    console.log({ jobLog });

    // const resBody = CreateAJobLogDto.parse(jobLog);
    // const
    return {
      statusCode: 200,
      body: JSON.stringify(jobLog),
    };
  },
);
