import { z } from 'zod';
import { JobListRankDto } from '.';
import { JobDto } from './job.dto';

export const CreateJobBaseDto = JobDto.omit({
  id: true,
  userId: true,
  jobListRank: true,
}).extend({
  jobListRank: JobListRankDto.optional(),
});

type CreateJobBaseDto = z.output<typeof CreateJobBaseDto>;

export const jobListRankSuperRefine = (
  val: CreateJobBaseDto,
  ctx: z.RefinementCtx,
) => {
  if (!!val.jobListRank && !val.jobListId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'jobListId is required when updating jobListRank',
      path: ['jobListId'],
    });
  }
};

export const CreateJobDto = CreateJobBaseDto.superRefine(
  jobListRankSuperRefine,
);
