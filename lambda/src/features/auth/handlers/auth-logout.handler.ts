import { authHandler } from '@/features/auth/utils';
import { EventHandler } from '@/shared/types';
import { BuildOpenApiSpecArgOperationObj } from '@/shared';
import { userDB } from '@/shared/db/user-db.service';

export const authLogoutHandlerSpec: BuildOpenApiSpecArgOperationObj = {
  responses: {
    200: {
      description: '',
    },
  },
};

export const authLogoutHandler: EventHandler = authHandler(async (authUser) => {
  await userDB.update({
    id: authUser.id,
    refreshToken: undefined,
  });

  return {
    statusCode: 200,
  };
});
