import { EventHandler } from '@/shared/types';
import {
  apiError,
  BuildOpenApiSpecArgOperationObj,
  notFoundException,
} from '@/shared';
import { JobListDto, JobListIdPathParamsDto } from '../dto';
import { jobListDB } from '@/shared/db/job-list-db.service';
import { authHandler } from '@/features/auth';

export const getAJobListHandlerSpec: BuildOpenApiSpecArgOperationObj = {
  zodPathParamsSchema: JobListIdPathParamsDto,
  responses: {
    200: {
      description: '',
      content: {
        'application/json': {
          zodSchema: { JobListDto },
        },
      },
    },
    404: { description: '' },
  },
};

export const getAJobListHandler: EventHandler = authHandler(
  async (authUser, event) => {
    const res = JobListIdPathParamsDto.safeParse(event.pathParameters);
    if (res.error) return apiError(res.error);

    const jobList = await jobListDB.queryUnique(authUser.id, res.data.id);
    if (!jobList) throw notFoundException();

    const body = JobListDto.parse(jobList);
    return {
      statusCode: 200,
      body: JSON.stringify(body),
    };
  },
);
