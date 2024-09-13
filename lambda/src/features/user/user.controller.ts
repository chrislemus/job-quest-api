import { buildController } from '@/shared';
import {
  getUserProfileHandlerSpec,
  getUserProfileHandler,
  deleteUserHandler,
  deleteUserHandlerSpec,
} from './handlers';

export const userController = buildController({
  'user/profile': {
    get: {
      handlerFn: getUserProfileHandler,
      ...getUserProfileHandlerSpec,
    },
  },
  'user/{id}': {
    delete: {
      handlerFn: deleteUserHandler,
      ...deleteUserHandlerSpec,
    },
  },
});
