import { z } from 'zod';
import { JobListRankDto } from '.';
import { JobDto } from './job.dto';

export const CreateJobBaseDto = JobDto.omit({
  id: true,
  userId: true,
  jobRank: true,
}).extend({
  jobRank: JobListRankDto.optional(),
});

type CreateJobBaseDto = z.output<typeof CreateJobBaseDto>;

export const jobListRankSuperRefine = (
  val: CreateJobBaseDto,
  ctx: z.RefinementCtx,
) => {
  if (!!val.jobRank && !val.jobListId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'jobListId is required when updating jobRank',
      path: ['jobListId'],
    });
  }
};

export const CreateJobDto = CreateJobBaseDto.superRefine(
  jobListRankSuperRefine,
);
