import { EventHandler } from '@/shared/types';
import { BuildOpenApiSpecArgOperationObj } from '@/shared';
import { JobListIdPathParamsDto } from '../dto';

export const deleteAJobListHandlerSpec: BuildOpenApiSpecArgOperationObj = {
  zodPathParamsSchema: JobListIdPathParamsDto,
  responses: {
    200: { description: 'Job List deleted' },
    404: { description: 'Job List not found' },
  },
};

export const deleteAJobListHandler: EventHandler = async (event) => {
  return {
    status: 200,
    body: { event, custom: 'GETSignuphandler' },
  };
};
