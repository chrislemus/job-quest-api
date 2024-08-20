import { authHandler } from '../utils';
import { EventHandler } from '../../common/types';
import { BuildOpenApiSpecArgOperationObj } from '../../common';
import { UserDBService } from '../../db/user-db.service';

export const openapi: BuildOpenApiSpecArgOperationObj = {
  responses: {
    200: {
      description: '',
    },
  },
};

export const handler: EventHandler = authHandler(async (authUser) => {
  const userDB = new UserDBService();

  await userDB.update({
    id: authUser.id,
    refreshToken: undefined,
  });

  return {
    statusCode: 200,
  };
});
