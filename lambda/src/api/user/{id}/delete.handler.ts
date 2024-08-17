import { BuildOpenApiSpecArgOperationObj } from '../../common';
import { EventHandler } from '../../common/types';
import { userDeletePathParamsSchema } from '../schemas';

export const openapi: BuildOpenApiSpecArgOperationObj = {
  security: [{ bearerAuth: [] }],
  tags: ['user'],
  zodPathParamsSchema: userDeletePathParamsSchema,
  responses: {
    200: { description: 'delete' },
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
  console.log(event);
  return {
    statusCode: 200,
    body: JSON.stringify({ event, custom: 'GETSuserDeletelephandler' }),
  };
};
