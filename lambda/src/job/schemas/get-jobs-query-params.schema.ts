import { z } from 'zod';
import { paginationReqQuerySchema } from '../../pagination';

export const getJobsQueryParamsSchema = paginationReqQuerySchema.extend({
  jobListId: z.string().optional(),
});
