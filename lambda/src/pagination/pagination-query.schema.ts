import { z } from 'zod';

export const paginationReqQuerySchema = z.object({
  page: z.number().default(1).optional().describe('Page Number'),
  pageSize: z.number().default(10).optional().describe('Page Size'),
  pageTotalCount: z
    .boolean()
    .default(false)
    .optional()
    .describe('Retrieve total Count of Pages'),
});
