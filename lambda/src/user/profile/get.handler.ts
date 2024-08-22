import { userDB } from '@/db/user-db.service';
import { BuildOpenApiSpecArgOperationObj } from '../../common';
import { EventHandler } from '../../common/types';
import { userProfileResBodySchema } from '../schemas';
import { authHandler } from '@/auth';

export const openapi: BuildOpenApiSpecArgOperationObj = {
  responses: {
    200: {
      description: '',
      content: {
        'application/json': {
          zodSchema: { userProfileResBodySchema },
        },
      },
    },
  },
};

export const handler: EventHandler = authHandler(async (authUser) => {
  const user = await userDB.queryUnique(authUser.id);
  const body = userProfileResBodySchema.parse(user);

  return {
    statusCode: 200,
    body: JSON.stringify(body),
  };
});
