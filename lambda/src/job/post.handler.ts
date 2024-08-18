import { BuildOpenApiSpecArgOperationObj } from '../common';
import { EventHandler } from '../common/types';
import { createJobSchema } from './schemas';

export const openapi: BuildOpenApiSpecArgOperationObj = {
  responses: {
    200: {
      description: '',
    },
  },
  requestBody: {
    required: true,
    content: {
      'application/json': {
        zodSchema: { createJobSchema },
      },
    },
  },
};

export const handler: EventHandler = async (event, ctx) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ event, custom: 'GETSignuphandler' }),
  };
};
