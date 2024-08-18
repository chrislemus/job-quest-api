import { BuildOpenApiSpecArgOperationObj } from '../../common';
import { EventHandler } from '../../common/types';
import { authSignupReqBodySchema } from '../schemas';

export const openapi: BuildOpenApiSpecArgOperationObj = {
  security: [],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        zodSchema: { authSignupReqBodySchema },
      },
    },
  },
  responses: { 200: { description: 'Success signup' } },
};

export const handler: EventHandler = async (event, ctx) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ event, custom: 'GETSignuphandler' }),
  };
};
