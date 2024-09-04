import { createJobBaseSchema, jobListRankSuperRefine } from '../../schemas';

export const updateJobSchema = createJobBaseSchema
  .partial()
  .superRefine(jobListRankSuperRefine);
