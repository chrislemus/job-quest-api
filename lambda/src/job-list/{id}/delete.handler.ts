import { EventHandler } from '../../common/types';
import { BuildOpenApiSpecArgOperationObj } from '../../common';
import { jobListIdPathParamsSchema } from './schemas';

export const openapi: BuildOpenApiSpecArgOperationObj = {
  zodPathParamsSchema: jobListIdPathParamsSchema,
  responses: {
    200: { description: 'Job List deleted' },
    404: { description: 'Job List not found' },
  },
};

export const handler: EventHandler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ event, custom: 'GETSignuphandler' }),
  };
};
