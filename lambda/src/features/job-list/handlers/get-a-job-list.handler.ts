import { EventHandler } from '@/shared/types';
import { JobListDto, JobListIdPathParamsDto } from '../dto';
import { jobListDB } from '@/shared/db/job-list-db.service';
import { authHandler } from '@/features/auth';
import {
  apiParse,
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
    const pathParams = await apiParse(JobListIdPathParamsDto, req.pathParams);

    const jobList = await jobListDB.queryUnique(authUser.id, pathParams.id);
    if (!jobList) throw notFoundException();

    const body = JobListDto.parse(jobList);
    return {
      status: 200,
      body: body,
    };
  },
);
