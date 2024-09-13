import { EventHandler } from '@/shared/types';
import { apiError, BuildOpenApiSpecArgOperationObj } from '@/shared';
import { JobDto, JobIdPathParamsDto, UpdateJobDto } from '../dto';
import { authHandler } from '@/features/auth';
import { jobDB } from '@/shared/db/job-db.service';
import { jobListDataUtil } from '../job-list-data.util';

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

export const updateAJobHandler: EventHandler = authHandler(
  async (authUser, event) => {
    const pathParams = JobIdPathParamsDto.safeParse(event.pathParameters);
    if (pathParams.error) return apiError(pathParams.error);
    const body = UpdateJobDto.safeParse(JSON.parse(event.body || '{}'));
    if (body.error) return apiError(body.error);
    const jobId = pathParams.data.id;
    const userId = authUser.id;
    const { jobListId, jobListRank, ...jobData } = body.data;

    const jobListUpdates = jobListId
      ? await jobListDataUtil.getJobListData(
          authUser.id,
          jobListId,
          jobListRank,
        )
      : {};

    await jobDB.update({
      userId,
      id: jobId,
      ...jobData,
      ...jobListUpdates,
    });

    const job = await jobDB.getUnique(userId, jobId);

    return {
      statusCode: 200,
      body: JSON.stringify(job),
    };
  },
);
