import { paginationReqQuerySchema } from '../../pagination';
import { z } from 'zod';

export const getJobListsQueryParamsSchema = paginationReqQuerySchema.extend({
  jobListId: z.string().optional(),
});
