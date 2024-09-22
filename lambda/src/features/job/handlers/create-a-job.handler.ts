import { authHandler } from '@/features/auth';
import {
  apiError,
  BuildOpenApiSpecArgOperationObj,
  internalServerException,
} from '@/shared';
import { EventHandler } from '@/shared/types';
import { CreateJobDto, JobDto } from '../dto';
import { jobListDataUtil } from '../job-list-data.util';
import { jobDB } from '@/shared/db/job-db.service';

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

export const createAJobHandler: EventHandler = authHandler(async (req, ctx) => {
  const { authUser } = ctx;
  const res = CreateJobDto.safeParse(req.body);
  if (res.error) return apiError(res.error);
  const reqBody = res.data;

  const { jobListId, jobListRank, ...jobData } = reqBody;

  const jobListUpdates = await jobListDataUtil.getJobListData(
    authUser.id,
    jobListId,
    jobListRank,
  );

  const job = await jobDB.create({
    userId: authUser.id,
    ...jobData,
    ...jobListUpdates,
  });

  if (!job) throw internalServerException();

  const body = JobDto.parse(job);
  // const
  return {
    status: 200,
    body: body,
  };
});
