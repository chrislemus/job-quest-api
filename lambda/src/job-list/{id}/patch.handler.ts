import { EventHandler } from '../../common/types';
import { BuildOpenApiSpecArgOperationObj } from '../../common';
import { jobListSchema, updateJobListSchema } from './schemas';
import { jobListIdPathParamsSchema } from './schemas';

export const openapi: BuildOpenApiSpecArgOperationObj = {
  zodPathParamsSchema: jobListIdPathParamsSchema,
  responses: {
    200: {
      description: '',
      content: {
        'application/json': {
          zodSchema: { jobListSchema },
        },
      },
    },
    400: { description: 'Bad Request' },
  },
  requestBody: {
    required: true,
    content: {
      'application/json': {
        zodSchema: { updateJobListSchema },
      },
    },
  },
};

export const handler: EventHandler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ event, custom: 'GETSignuphandler' }),
  };
};
