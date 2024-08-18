import { z } from 'zod';
import { BuildOpenApiSpecArgOperationObj } from '../common';
import { EventHandler } from '../common/types';
import { getJobsQueryParamsSchema, jobPageResSchema } from './schemas';

export const openapi: BuildOpenApiSpecArgOperationObj = {
  zodQueryParamsSchema: getJobsQueryParamsSchema,
  responses: {
    200: {
      description: '',
      content: {
        'application/json': {
          zodSchema: jobPageResSchema,
        },
      },
    },
  },
};

export const handler: EventHandler = async (event) => {
  // const data = eventSchema.parse(event);
  // event.body
  return {
    statusCode: 200,
    body: JSON.stringify({ event, custom: 'GETSignuphandler' }),
  };
};
