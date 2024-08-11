import { z } from 'zod';
import { buildOpenapiSpec } from '../common';
import { paginationReqQuerySchema } from '../pagination/schemas';
import { userSchema } from '../user/schemas';

const jobListSchema = z.object({
  id: z.string().uuid(),
  // title: z.string(),
  // userId: userSchema.shape.id,
});

const pageInfoSchema = z.object({
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
const jobSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  company: z.string(),
  location: z.string().optional(),
  url: z.string().optional(),
  salary: z.string().optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  jobListRank: z.number(),
  jobListId: jobListSchema.shape.id,
  userId: userSchema.shape.id,
});

function pageRes<T extends string>(dataName: T, schema: z.ZodTypeAny) {
  return z.object({
    pageInfo: pageInfoSchema,
    [dataName]: z.array(schema),
  });
}
const adede = pageRes('items', jobSchema);

const findManyJobsPageResSchema = z.object({
  pageInfo: pageInfoSchema,
  items: z.array(jobSchema),
});

const findManyJobsQueryParamsSchema = paginationReqQuerySchema.extend({
  jobListId: z.string().optional(),
});

export const jobOpenApi = buildOpenapiSpec({
  paths: {
    '/job': {
      get: {
        tags: ['job'],
        // parameters: zodToParamJson(userProfileReqQuerySchema, 'query'),
        zodQueryParamsSchema: findManyJobsQueryParamsSchema,
        responses: {
          200: {
            description: 'Job by Id',
            content: {
              'application/json': {
                zodSchema: { findManyJobsPageResSchema },
              },
            },
            // content: {
            //   'application/json': {
            //     schema: jobSchema,
            //   },
            // },
          },
        },
      },
    },
  },
});
