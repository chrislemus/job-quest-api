import { jobSchema } from './job.schema';

export const createJobSchema = jobSchema
  .omit({
    id: true,
    userId: true,
  })
  .partial({ jobListRank: true });
