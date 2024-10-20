import { EventHandler } from '@/shared/types';
import { apiParse, BuildOpenApiSpecArgOperationObj } from '@/shared';
import { JobListDto, UpdateJobListDto, JobListIdPathParamsDto } from '../dto';
import { authHandler } from '@/features/auth';
import { jobListDB } from '@/shared/db/job-list-db.service';

export const updateAJobListHandlerSpec: BuildOpenApiSpecArgOperationObj = {
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
    400: { description: 'Bad Request' },
  },
  requestBody: {
    required: true,
    content: {
      'application/json': {
        zodSchema: { UpdateJobListDto },
      },
    },
  },
};

export const updateAJobListHandler: EventHandler = authHandler(
  async (req, ctx) => {
    const { authUser } = ctx;
    const pathParams = await apiParse(JobListIdPathParamsDto, req.pathParams);
    const jobListId = pathParams.id;

    const reqBody = await apiParse(UpdateJobListDto, req.body);

    const jobList = await jobListDB.update({
      id: jobListId,
      userId: authUser.id,
      label: reqBody.label,
    });

    const body = JobListDto.parse(jobList);
    return {
      status: 200,
      body: body,
    };
  },
);
