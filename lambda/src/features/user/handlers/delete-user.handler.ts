import { BuildOpenApiSpecArgOperationObj } from '@/shared';
import { EventHandler } from '@/shared/types';
import { UserDeletePathParamsDto } from '../dto';

export const deleteUserHandlerSpec: BuildOpenApiSpecArgOperationObj = {
  zodPathParamsSchema: UserDeletePathParamsDto,
  responses: {
    200: { description: '' },
  },
};

export const deleteUserHandler: EventHandler = async (event, ctx) => {
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
