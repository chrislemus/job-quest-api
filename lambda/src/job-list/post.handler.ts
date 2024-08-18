import { BuildOpenApiSpecArgOperationObj } from '../common';
import { EventHandler } from '../common/types';
import { createJobListSchema, jobListSchema } from './schemas';

export const openapi: BuildOpenApiSpecArgOperationObj = {
  responses: {
    201: {
      description: '',
      content: {
        'application/json': {
          zodSchema: { jobListSchema },
        },
      },
    },
  },
  requestBody: {
    required: true,
    content: {
      'application/json': {
        zodSchema: { createJobListSchema },
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
