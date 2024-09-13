import { EventHandler } from '@/shared/types';
import { BuildOpenApiSpecArgOperationObj } from '@/shared';
import { JobDto, JobIdPathParamsDto } from '../dto';

export const deleteAJobHandlerSpec: BuildOpenApiSpecArgOperationObj = {
  zodPathParamsSchema: JobIdPathParamsDto,
  responses: {
    200: {
      description: '',
      content: {
        'application/json': {
          zodSchema: { JobDto },
        },
      },
    },
  },
};

export const deleteAJobHandler: EventHandler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ event, custom: 'GETSignuphandler' }),
  };
};
