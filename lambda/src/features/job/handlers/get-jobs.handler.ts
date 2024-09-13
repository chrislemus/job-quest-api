import { apiError, BuildOpenApiSpecArgOperationObj } from '@/shared';
import { EventHandler } from '@/shared/types';
import { GetJobsQueryParamsDto, JobPageResDto } from '../dto';
import { Job, jobDB } from '@/shared/db/job-db.service';
import { authHandler } from '@/features/auth';

export const getJobsHandlerSpec: BuildOpenApiSpecArgOperationObj = {
  zodQueryParamsSchema: GetJobsQueryParamsDto,
  responses: {
    200: {
      description: '',
      content: {
        'application/json': {
          zodSchema: JobPageResDto,
        },
      },
    },
  },
};

export const getJobsHandler: EventHandler = authHandler(
  async (authUser, event) => {
    const res = GetJobsQueryParamsDto.safeParse(event.queryStringParameters);
    if (res.error) return apiError(res.error);
    let items: Job[] = [];

    if (res.data.jobListId) {
      const jobs = await jobDB.findAllByJobListId(
        authUser.id,
        res.data.jobListId,
      );
      if (jobs) items = jobs;
      // throw new Error('jobListId is not implemented yet');
    } else {
      const { Items } = await jobDB.findAll(authUser.id);
      if (Items) items = Items;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ items }),
    };
  },
);
