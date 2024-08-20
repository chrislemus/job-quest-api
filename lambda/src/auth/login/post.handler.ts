import { UserDBService } from '../../db/user-db.service';
import { apiError, BuildOpenApiSpecArgOperationObj } from '../../common';
import { EventHandler } from '../../common/types';
import { authLoginReqBodySchema, jwtSchema } from '../schemas';
import bcrypt from 'bcryptjs';
import { getTokens } from '../utils';

export const openapi: BuildOpenApiSpecArgOperationObj = {
  security: [],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        zodSchema: { authLoginReqBodySchema },
      },
    },
  },
  responses: {
    200: {
      description: '',
      content: {
        'application/json': {
          zodSchema: { jwtSchema },
        },
      },
    },
    401: { description: '' },
  },
};

export const handler: EventHandler = async (event) => {
  const userDB = new UserDBService();
  const res = authLoginReqBodySchema.safeParse(JSON.parse(event.body || '{}'));
  if (res.error) return apiError(res.error);
  const user = await userDB.findByEmail(res.data.email);

  try {
    if (!user?.password) throw new Error('User password not set');
    const isMatch = await bcrypt.compare(res.data.password, user.password);
    if (!isMatch) throw new Error('Password does not match');

    const tokens = await getTokens(user);
    const body = JSON.stringify(tokens);
    return { statusCode: 200, body };
  } catch (error) {
    console.error(error);
  }

  return { statusCode: 401 };
};
