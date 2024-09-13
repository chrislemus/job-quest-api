import { buildController } from '@/shared';
import {
  getJobListHandler,
  getJobListHandlerSpec,
  createJobListHandler,
  createJobListHandlerSpec,
  getAJobListHandlerSpec,
  getAJobListHandler,
  deleteAJobListHandler,
  deleteAJobListHandlerSpec,
  updateAJobListHandler,
  updateAJobListHandlerSpec,
} from './handlers';

export const jobListController = buildController({
  'job-list': {
    get: {
      handlerFn: getJobListHandler,
      ...getJobListHandlerSpec,
    },
    post: {
      handlerFn: createJobListHandler,
      ...createJobListHandlerSpec,
    },
  },
  'job-list/{id}': {
    delete: {
      handlerFn: deleteAJobListHandler,
      ...deleteAJobListHandlerSpec,
    },
    get: {
      handlerFn: getAJobListHandler,
      ...getAJobListHandlerSpec,
    },
    patch: {
      handlerFn: updateAJobListHandler,
      ...updateAJobListHandlerSpec,
    },
  },
});
