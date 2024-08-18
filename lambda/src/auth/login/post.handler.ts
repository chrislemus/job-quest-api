import { BuildOpenApiSpecArgOperationObj } from '../../common';
import { EventHandler } from '../../common/types';
import { authLoginReqBodySchema, jwtSchema } from '../schemas';

export const openapi: BuildOpenApiSpecArgOperationObj = {
  security: [],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        zodSchema: { authLoginReqBodySchema },
      },
    },
  },
  responses: {
    200: {
      description: '',
      content: {
        'application/json': {
          zodSchema: { jwtSchema },
        },
      },
    },
    401: { description: '' },
  },
};

export const handler: EventHandler = async (event, ctx) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ event, custom: 'POSThandler' }),
  };
};
