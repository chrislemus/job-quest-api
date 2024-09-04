import { z } from 'zod';
import { jobListRankDto } from '../dto';
import { jobSchema } from './job.schema';

export const createJobBaseSchema = jobSchema
  .omit({
    id: true,
    userId: true,
    jobListRank: true,
  })
  .extend({
    jobListRank: jobListRankDto.optional(),
  });

type CreateJobBaseDto = z.output<typeof createJobBaseSchema>;

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

export const createJobSchema = createJobBaseSchema.superRefine(
  jobListRankSuperRefine,
);
