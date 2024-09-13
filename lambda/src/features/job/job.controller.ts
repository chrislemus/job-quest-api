import { buildController } from '@/shared';
import {
  getJobsHandler,
  getJobsHandlerSpec,
  createAJobHandler,
  createAJobHandlerSpec,
  getAJobHandlerSpec,
  getAJobHandler,
  deleteAJobHandler,
  deleteAJobHandlerSpec,
  updateAJobHandler,
  updateAJobHandlerSpec,
} from './handlers';

export const jobController = buildController({
  job: {
    get: {
      handlerFn: getJobsHandler,
      ...getJobsHandlerSpec,
    },
    post: {
      handlerFn: createAJobHandler,
      ...createAJobHandlerSpec,
    },
  },
  'job/{id}': {
    delete: {
      handlerFn: deleteAJobHandler,
      ...deleteAJobHandlerSpec,
    },
    get: {
      handlerFn: getAJobHandler,
      ...getAJobHandlerSpec,
    },
    patch: {
      handlerFn: updateAJobHandler,
      ...updateAJobHandlerSpec,
    },
  },
});
