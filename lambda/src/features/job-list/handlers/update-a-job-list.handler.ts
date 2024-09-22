import { EventHandler } from '@/shared/types';
import { apiError, BuildOpenApiSpecArgOperationObj } from '@/shared';
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
    const res = JobListIdPathParamsDto.safeParse(req.pathParams);
    if (res.error) return apiError(res.error);
    const jobListId = res.data.id;

    const res2 = UpdateJobListDto.safeParse(JSON.parse(req.body || '{}'));
    if (res2.error) return apiError(res2.error);
    const { label } = res2.data;

    const jobList = await jobListDB.update({
      id: jobListId,
      userId: authUser.id,
      label,
    });

    const body = JobListDto.parse(jobList);
    return {
      status: 200,
      body: body,
    };
  },
);
