import { authHandler } from '@/features/auth';
import { EventHandler } from '@/shared/types';
import { CreateJobDto, JobDto } from '../dto';
import { jobListDataUtil } from '../utils';
import { JobQuestDBService } from '@/core/database';
import {
  apiParse,
  BuildOpenApiSpecArgOperationObj,
  internalServerException,
  uuid,
  zodToJson,
} from '@/shared';
import { z } from 'zod';

export const createAJobHandlerSpec: BuildOpenApiSpecArgOperationObj = {
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
        zodSchema: { CreateJobDto },
      },
    },
  },
};

const myFunction = z
  .function()
  .args(
    z.object({
      queryParams: z.object({ jobId: z.string() }),
      body: CreateJobDto,
    }),
  ) // accepts an arbitrary number of arguments
  .returns(z.object({ status: z.number() }));

const aaaa = zodToJson(myFunction.parameters().items[0]);
console.log(aaaa);
export const createAJobHandler: EventHandler = authHandler(async (req, ctx) => {
  const userId = ctx.authUser.id;
  const reqBody = await apiParse(CreateJobDto, req.body);

  const { jobListId, jobRank, ...jobData } = reqBody;

  const jobListUpdates = await jobListDataUtil.getJobListData(
    userId,
    jobListId,
    jobRank,
  );

  const jobId = uuid();
  const jobToCreate = {
    jobId,
    userId,
    ...jobData,
    ...jobListUpdates,
  } as const;

  const dbRes = await JobQuestDBService.transaction
    .write(({ job, jobRank }) => [
      job.create({ ...jobToCreate }).commit(),
      jobRank
        .create({
          jobListId,
          jobId,
          jobRank: jobToCreate.jobRank,
        })
        .commit(),
    ])
    .go();

  if (dbRes.canceled) throw internalServerException();
  const { data: job } = await JobQuestDBService.entities.job
    .get({ userId, jobId })
    .go();

  if (!job) throw internalServerException();

  const body = JobDto.parse(job);
  return {
    status: 200,
    body: body,
  };
});
