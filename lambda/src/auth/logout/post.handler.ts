import { BuildOpenApiSpecArgOperationObj } from '../../common';
import { EventHandler } from '../../common/types';

export const openapi: BuildOpenApiSpecArgOperationObj = {
  responses: {
    200: {
      description: '',
    },
  },
};

export const handler: EventHandler = async (event, ctx) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ event, custom: 'POSThandler' }),
  };
};
