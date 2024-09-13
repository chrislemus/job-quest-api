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
  async (authUser, event) => {
    const res = CreateJobListDto.safeParse(JSON.parse(event.body || '{}'));
    if (res.error) return apiError(res.error);

    const { label } = res.data;

    const jobList = await jobListDB.create({
      userId: authUser.id,
      label,
    });

    const body = JobListDto.parse(jobList);
    return {
      statusCode: 201,
      body: JSON.stringify(body),
    };
    // return {
    //   statusCode: 200,
    //   body: JSON.stringify({ event, custom: 'GETSignuphandler' }),
    // };
  },
);
