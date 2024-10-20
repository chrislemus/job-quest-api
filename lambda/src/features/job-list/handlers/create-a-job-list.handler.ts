import { authHandler } from '@/features/auth';
import { apiParse, BuildOpenApiSpecArgOperationObj } from '@/shared';
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
    const userId = ctx.authUser.id;
    const reqBody = await apiParse(CreateJobListDto, req.body);

    const jobList = await jobListDB.create({
      userId,
      label: reqBody.label,
    });

    const body = JobListDto.parse(jobList);
    return {
      status: 201,
      body: body,
    };
  },
);
