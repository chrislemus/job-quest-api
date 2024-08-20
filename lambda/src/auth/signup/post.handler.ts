import { apiError, BuildOpenApiSpecArgOperationObj } from '../../common';
import { EventHandler } from '../../common/types';
import { authSignupReqBodySchema, jwtSchema } from '../schemas';
import { UserDBService } from '../../db/user-db.service';
import { createNewUserStarterData } from '../../user/utils';
import { getTokens } from '../utils';

export const openapi: BuildOpenApiSpecArgOperationObj = {
  security: [],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        zodSchema: { authSignupReqBodySchema },
      },
    },
  },
  responses: {
    200: {
      description: 'Success signup',
      content: {
        'application/json': {
          zodSchema: { jwtSchema },
        },
      },
    },
    400: { description: '' },
  },
};

export const handler: EventHandler = async (event) => {
  const res = await authSignupReqBodySchema.spa(JSON.parse(event.body || '{}'));
  if (res.error) return apiError(res.error);

  const userDB = new UserDBService();
  const user = await userDB.create(res.data);

  createNewUserStarterData(user);
  const tokens = await getTokens(user);

  return { statusCode: 200, body: JSON.stringify(tokens) };
};
