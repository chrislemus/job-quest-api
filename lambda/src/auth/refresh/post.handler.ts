import { EventHandler } from '../../common/types';
import { jwtSchema } from '../schemas';
import jwt from 'jsonwebtoken';
import { getTokens } from '../utils';
import { UserDBService } from '../../db/user-db.service';
import bcrypt from 'bcryptjs';
import { JwtPayload } from '../types';
import { appConfig, BuildOpenApiSpecArgOperationObj } from '../../common';

export const openapi: BuildOpenApiSpecArgOperationObj = {
  responses: {
    200: {
      description: '',
      content: {
        'application/json': {
          zodSchema: { jwtSchema },
        },
      },
    },
  },
};

export const handler: EventHandler = async (event) => {
  try {
    const refreshToken = event.headers.Authorization?.split(' ')[1];
    if (!refreshToken) throw new Error('No token provided');
    const payload = jwt.verify(
      refreshToken,
      appConfig().JWT_REFRESH_SECRET,
    ) as JwtPayload;

    const userDB = new UserDBService();

    const dbUser = await userDB.queryUnique(payload.id);
    if (!dbUser?.refreshToken) throw new Error('User refresh token not found');

    const isMatch = await bcrypt.compare(refreshToken, dbUser.refreshToken);
    if (!isMatch) throw new Error('Refresh token mismatch');

    const tokens = await getTokens(payload);
    const body = JSON.stringify(tokens);
    return { statusCode: 200, body };
  } catch (error) {
    console.error(error);
    return { statusCode: 401 };
  }
};
