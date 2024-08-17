import { BuildOpenApiSpecArgOperationObj } from '../../common';
import { EventHandler } from '../../common/types';
import { authLoginReqBodySchema, jwtSchema } from '../schemas';

export const openapi: BuildOpenApiSpecArgOperationObj = {
  tags: ['auth'],
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
  // const queryParams = {};
  // if (event.multiValueQueryStringParameters) {
  //   Object.entries(event.multiValueQueryStringParameters).forEach(
  //     ([key, value]) => {
  //       if (!value) return;
  //       queryParams[key] = value.length === 1 ? value[0] : value;
  //     },
  //   );
  // }
  // event['queryParams'] = queryParams;
  // console.log(event);
  return {
    statusCode: 200,
    body: JSON.stringify({ event, custom: 'POSThandler' }),
  };
};
