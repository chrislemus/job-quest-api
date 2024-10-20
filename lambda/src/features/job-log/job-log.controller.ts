import { buildController } from '@/shared';
// import {
//   getJobListHandler,
//   getJobListHandlerSpec,
//   createJobListHandler,
//   createJobListHandlerSpec,
//   getAJobListHandlerSpec,
//   getAJobListHandler,
//   deleteAJobListHandler,
//   deleteAJobListHandlerSpec,
//   updateAJobListHandler,
//   updateAJobListHandlerSpec,
// } from './handlers';
// import {
//   createAJobLogHandler,
//   createAJobLogHandlerSpec,
// } from './handlers/create-a-job-log.handler';
// import {
//   getAJobLogHandler,
//   getAJobLogHandlerSpec,
// } from './handlers/get-a-job-log.handler';
// import {
//   getJobLogsHandler,
//   getJobLogsHandlerSpec,
// } from './handlers/get-job-logs.handler';
import {
  deleteAJobLogHandler,
  deleteAJobLogHandlerSpec,
  getJobLogsHandler,
  getJobLogsHandlerSpec,
  getAJobLogHandler,
  getAJobLogHandlerSpec,
  createAJobLogHandler,
  createAJobLogHandlerSpec,
} from './handlers';

export const jobLogController = buildController({
  'job-log': {
    get: {
      // not done
      // not done
      // not done
      handlerFn: getJobLogsHandler,
      ...getJobLogsHandlerSpec,
    },
    post: {
      handlerFn: createAJobLogHandler,
      ...createAJobLogHandlerSpec,
    },
  },
  'job-log/{id}': {
    delete: {
      // not done
      // not done
      // not done
      handlerFn: deleteAJobLogHandler,
      ...deleteAJobLogHandlerSpec,
    },
    get: {
      handlerFn: getAJobLogHandler,
      ...getAJobLogHandlerSpec,
    },
    patch: {
      // not done
      // not done
      // not done
      handlerFn: getAJobLogHandler,
      ...getAJobLogHandlerSpec,
    },
  },
});
