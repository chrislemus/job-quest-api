import { jobListRankDto } from '../dto';
import { jobSchema } from './job.schema';

export const createJobSchema = jobSchema
  .omit({
    id: true,
    userId: true,
    jobListRank: true,
  })
  .extend({
    jobListRank: jobListRankDto.optional(),
  });
