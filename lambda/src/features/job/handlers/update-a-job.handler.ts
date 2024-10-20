import { EventHandler } from '@/shared/types';
import {
  apiParse,
  BuildOpenApiSpecArgOperationObj,
  internalServerException,
} from '@/shared';
import { JobDto, JobIdPathParamsDto, UpdateJobDto } from '../dto';
import { authHandler } from '@/features/auth';
import { jobListDataUtil } from '../utils';
import { JobQuestDBService } from '@/core/database';

export const updateAJobHandlerSpec: BuildOpenApiSpecArgOperationObj = {
  zodPathParamsSchema: JobIdPathParamsDto,
  responses: {
    200: {
      description: '',
      content: {
        'application/json': {
          zodSchema: { JobDto },
        },
      },
    },
  },
  requestBody: {
    required: true,
    content: {
      'application/json': {
        zodSchema: { UpdateJobDto },
      },
    },
  },
};

export const updateAJobHandler: EventHandler = authHandler(async (req, ctx) => {
  const userId = ctx.authUser.id;
  const pathParams = await apiParse(JobIdPathParamsDto, req.pathParams);
  const reqBody = await apiParse(UpdateJobDto, req.body);

  const jobId = pathParams.id;
  const { jobListId, jobRank, ...jobData } = reqBody;

  const jobListUpdates = jobListId
    ? await jobListDataUtil.getJobListData(userId, jobListId, jobRank)
    : null;
  console.log({ jobListUpdates });
  const jobUpdates = { ...jobData, jobListUpdates };
  if (jobListUpdates) Object.assign(jobUpdates, jobListUpdates);

  let jobRankToDelete: { jobListId: string; jobRank: string } | null = null;
  if (jobListUpdates) {
    const { data: oldJob } = await JobQuestDBService.entities.job
      .get({ userId, jobId })
      .go();
    if (!oldJob) throw internalServerException();
    jobRankToDelete = { jobListId: oldJob.jobListId, jobRank: oldJob.jobRank };
  }

  const jobDbRes = await JobQuestDBService.transaction
    .write((e) => {
      const updates = [
        e.job
          .patch({ userId, jobId })
          .set({ ...jobUpdates })
          .commit(),
      ];

      if (jobListUpdates && jobRankToDelete) {
        updates.push(e.jobRank.delete(jobRankToDelete).commit());
        const { jobListId, jobRank } = jobListUpdates;
        updates.push(e.jobRank.create({ jobListId, jobId, jobRank }).commit());
      }
      return updates;
    })
    .go();

  if (jobDbRes.canceled) throw internalServerException();

  // const job = await jobDB.getUnique(userId, jobId);
  const { data: job } = await JobQuestDBService.entities.job
    .get({ userId, jobId })
    .go();
  if (!job) throw internalServerException();

  return {
    status: 200,
    body: JobDto.parse(job),
  };
});
