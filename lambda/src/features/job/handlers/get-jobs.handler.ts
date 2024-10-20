import {
  apiParse,
  BuildOpenApiSpecArgOperationObj,
  internalServerException,
} from '@/shared';
import { EventHandler } from '@/shared/types';
import { GetJobsQueryParamsDto, JobPageResDto, PageResOfJobDto } from '../dto';
import { authHandler } from '@/features/auth';
import { JobQuestDBService } from '@/core/database';

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

export const getJobsHandler: EventHandler = authHandler(async (req, ctx) => {
  const userId = ctx.authUser.id;
  const queryParams = await apiParse(GetJobsQueryParamsDto, req.queryParams);

  let items: PageResOfJobDto['items'] = [];

  if (queryParams.jobListId) {
    const { data: jobRanks } = await JobQuestDBService.entities.jobRank.query
      .jobRank({
        userId,
        jobListId: queryParams.jobListId,
      })
      .go({ pages: 'all', order: 'asc' });
    if (jobRanks.length > 0) {
      const jobsDbRes = await JobQuestDBService.entities.job
        .get([
          ...jobRanks.map(({ jobId }) => {
            return { userId, jobId } as const;
          }),
        ])
        .go();
      if (jobsDbRes.unprocessed.length > 0) {
        throw internalServerException('Failed to get all jobs');
      }
      items = jobsDbRes.data;
    }
    // const jobs = await jobDB.findAllByJobListId(
    //   authUser.id,
    //   res.data.jobListId,
    // );
    // if (jobs) items = jobs;
    // throw new Error('jobListId is not implemented yet');
  } else {
    const jobsDbRes = await JobQuestDBService.entities.job.query
      .job({ userId })
      .go();
    items = jobsDbRes.data;
    // const { Items } = await jobDB.findAll(authUser.id);
    // if (Items) items = Items;
  }

  return {
    status: 200,
    body: { items },
  };
});
