import { z } from 'zod';
import { buildOpenapiSpec } from '../common';
import { paginationReqQuerySchema } from '../pagination';
import { pageResOfJobSchema } from './schemas';

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
                zodSchema: { pageResOfJobSchema },
              },
            },
          },
        },
      },
    },
    '/job/{id}': {
      get: {
        tags: ['job'],
        // parameters: zodToParamJson(userProfileReqQuerySchema, 'query'),
        // zodQueryParamsSchema: findManyJobsQueryParamsSchema,
        // responses: {
        //   200: {
        //     description: 'Job by Id',
        //     content: {
        //       'application/json': {
        //         zodSchema: { pageResOfJobSchema },
        //       },
        //     },
        //   },
        // },
        responses: {
          200: {
            description: 'Job by Id',
            // content: {
            //   'application/json': {
            //     zodSchema: { pageResOfJobSchema },
            //   },
          },
        },
      },
    },
  },
});
