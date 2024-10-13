import { authHandler } from '@/features/auth';
import { apiError, BuildOpenApiSpecArgOperationObj } from '@/shared';
import { EventHandler } from '@/shared/types';
import { CreateJobListDto, JobListDto } from '../dto';
import { jobListDB } from '@/shared/db/job-list-db.service';

export const createJobListHandlerSpec: BuildOpenApiSpecArgOperationObj = {
  responses: {
    201: {
      description: '',
      content: {
        'application/json': {
          zodSchema: { JobListDto },
        },
      },
    },
  },
  requestBody: {
    required: true,
    content: {
      'application/json': {
        zodSchema: { CreateJobListDto },
      },
    },
  },
};

export const createJobListHandler: EventHandler = authHandler(
  async (req, ctx) => {
    const { authUser } = ctx;
    const res = CreateJobListDto.safeParse(req.body);
    if (res.error) return apiError(res.error);

    const { label } = res.data;

    const jobList = await jobListDB.create({
      userId: authUser.id,
      label,
    });

    const body = JobListDto.parse(jobList);
    return {
      status: 201,
      body: body,
    };
  },
);
