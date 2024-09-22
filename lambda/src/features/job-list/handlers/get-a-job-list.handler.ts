import { EventHandler } from '@/shared/types';
import { JobListDto, JobListIdPathParamsDto } from '../dto';
import { jobListDB } from '@/shared/db/job-list-db.service';
import { authHandler } from '@/features/auth';
import {
  apiError,
  BuildOpenApiSpecArgOperationObj,
  notFoundException,
} from '@/shared';

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
  async (req, ctx) => {
    const { authUser } = ctx;
    const res = JobListIdPathParamsDto.safeParse(req.pathParams);
    if (res.error) return apiError(res.error);

    const jobList = await jobListDB.queryUnique(authUser.id, res.data.id);
    if (!jobList) throw notFoundException();

    const body = JobListDto.parse(jobList);
    return {
      status: 200,
      body: body,
    };
  },
);
