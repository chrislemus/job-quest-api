import { buildController } from '@/shared';
import {
  authLoginHandler,
  authLoginHandlerSpec,
  authLogoutHandler,
  authLogoutHandlerSpec,
  authRefreshJwtHandler,
  authRefreshJwtHandlerSpec,
  authSignupHandler,
  authSignupHandlerSpec,
} from './handlers';

export const authController = buildController({
  'auth/signup': {
    post: {
      handlerFn: authSignupHandler,
      ...authSignupHandlerSpec,
    },
  },
  'auth/login': {
    post: {
      handlerFn: authLoginHandler,
      ...authLoginHandlerSpec,
    },
  },
  'auth/refresh': {
    post: {
      handlerFn: authRefreshJwtHandler,
      ...authRefreshJwtHandlerSpec,
    },
  },
  'auth/logout': {
    post: {
      handlerFn: authLogoutHandler,
      ...authLogoutHandlerSpec,
    },
  },
});
