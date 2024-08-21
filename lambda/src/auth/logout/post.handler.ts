import { authHandler } from '@/auth/utils';
import { EventHandler } from '@/common/types';
import { BuildOpenApiSpecArgOperationObj } from '@/common';
import { userDB } from '@/db/user-db.service';

export const openapi: BuildOpenApiSpecArgOperationObj = {
  responses: {
    200: {
      description: '',
    },
  },
};

export const handler: EventHandler = authHandler(async (authUser) => {
  await userDB.update({
    id: authUser.id,
    refreshToken: undefined,
  });

  return {
    statusCode: 200,
  };
});
