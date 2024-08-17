import { BuildOpenApiSpecArgOperationObj } from '../common';
import { EventHandler } from '../common/types';
import { findManyJobsQueryParamsSchema, pageResOfJobSchema } from './schemas';

export const openapi: BuildOpenApiSpecArgOperationObj = {
  tags: ['job'],
  // parameters: zodToParamJson(userProfileReqQuerySchema, 'query'),
  zodQueryParamsSchema: findManyJobsQueryParamsSchema,
  responses: {
    200: {
      description: 'Job by Id',
      content: {
        'application/json': {
          zodSchema: { pageResOfJobSchema },
        },
      },
    },
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
    body: JSON.stringify({ event, custom: 'GETSignuphandler' }),
  };
};
