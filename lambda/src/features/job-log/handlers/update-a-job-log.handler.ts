import { EventHandler } from '@/shared/types';
import { apiParse, BuildOpenApiSpecArgOperationObj } from '@/shared';
import { authHandler } from '@/features/auth';
import { UpdateAJobLogPathParamsDto, UpdateAJobLogReqBodyDto } from '../dto';
import { JobQuestDBService } from '@/core/database';
import { JobLogEntity } from '../entities';

export const updateAJobHandlerSpec: BuildOpenApiSpecArgOperationObj = {
  zodPathParamsSchema: UpdateAJobLogPathParamsDto,
  responses: {
    200: {
      description: '',
      content: {
        'application/json': {
          zodSchema: { JobLogEntity },
        },
      },
    },
  },
  requestBody: {
    required: true,
    content: {
      'application/json': {
        zodSchema: { UpdateAJobLogReqBodyDto },
      },
    },
  },
};

export const updateAJobHandler: EventHandler = authHandler(async (req, ctx) => {
  const userId = ctx.authUser.id;
  const pathParams = await apiParse(UpdateAJobLogPathParamsDto, req.pathParams);
  const reqBody = await apiParse(UpdateAJobLogReqBodyDto, req.body);

  const dbRes = await JobQuestDBService.entities.jobLog
    .patch({
      jobLogId: pathParams.id,
      userId,
    })
    .set(reqBody)
    .go();

  // const pathParams = JobIdPathParamsDto.safeParse(event.pathParameters);
  // if (pathParams.error) return apiError(pathParams.error);
  // const body = UpdateJobDto.safeParse(req.body);
  // if (body.error) return apiError(body.error);
  // const jobId = pathParams.data.id;
  // const userId = authUser.id;
  // const { jobListId, jobListRank, ...jobData } = body.data;
  // const jobListUpdates = jobListId
  //   ? await jobListDataUtil.getJobListData(
  //       authUser.id,
  //       jobListId,
  //       jobListRank,
  //     )
  //   : {};
  // await jobDB.update({
  //   userId,
  //   id: jobId,
  //   ...jobData,
  //   ...jobListUpdates,
  // });
  // const job = await jobDB.getUnique(userId, jobId);
  return {
    status: 200,
    body: dbRes.data,
  };
});
