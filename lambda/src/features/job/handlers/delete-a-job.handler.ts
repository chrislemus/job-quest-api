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
    status: 200,
    body: { event, custom: 'GETSignuphandler' },
  };
};
