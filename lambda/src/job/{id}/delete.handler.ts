import { EventHandler } from '../../common/types';
import { BuildOpenApiSpecArgOperationObj } from '../../common';
import { jobSchema } from '../schemas';
import { jobIdPathParamsSchema } from './schemas';

export const openapi: BuildOpenApiSpecArgOperationObj = {
  zodPathParamsSchema: jobIdPathParamsSchema,
  responses: {
    200: {
      description: '',
      content: {
        'application/json': {
          zodSchema: { jobSchema },
        },
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
