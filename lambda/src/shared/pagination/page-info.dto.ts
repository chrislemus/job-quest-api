import { z } from 'zod';

export const PageInfoDto = z.object({
  currentPage: z.number().describe('Current page number'),
  currentPageSize: z.number().describe('Requested page size'),
  currentPageCount: z
    .number()
    .describe('number Actual item/result count count of the current page'),
  totalPageCount: z
    .number()
    .optional()
    .describe(
      'number Total number of pages([pageTotalCount] query param must be set to `true` within your request)',
    ),
  totalCount: z
    .number()
    .optional()
    .describe(
      'number Total item count ([pageTotalCount] query param must be set to `true` within your request)',
    ),
});
