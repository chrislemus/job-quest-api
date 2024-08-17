import { z } from 'zod';
import { paginationReqQuerySchema } from '../../pagination';

export const findManyJobsQueryParamsSchema = paginationReqQuerySchema.extend({
  jobListId: z.string().optional(),
});
