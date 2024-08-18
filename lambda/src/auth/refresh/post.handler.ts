import { BuildOpenApiSpecArgOperationObj } from '../../common';
import { EventHandler } from '../../common/types';
import { jwtSchema } from '../schemas';

export const openapi: BuildOpenApiSpecArgOperationObj = {
  responses: {
    200: {
      description: '',
      content: {
        'application/json': {
          zodSchema: { jwtSchema },
        },
      },
    },
  },
};

export const handler: EventHandler = async (event, ctx) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ event, custom: 'POSTrefreshphandler' }),
  };
};
