import { BuildOpenApiSpecArgOperationObj } from '../../common';
import { EventHandler } from '../common.types';

export const openapi: BuildOpenApiSpecArgOperationObj = {};

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
    body: JSON.stringify({ event, custom: 'GEThandler' }),
  };
};
