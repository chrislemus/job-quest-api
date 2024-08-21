import { appConfig, BuildOpenApiSpecArgOperationObj } from '@/common';
import { EventHandler } from '@/common/types';
import { jwtSchema } from '@/auth/schemas';
import jwt from 'jsonwebtoken';
import { getTokens } from '@/auth/utils';
import { userDB } from '@/db/user-db.service';
import bcrypt from 'bcryptjs';
import { JwtPayload } from '@/auth/types';

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
      appConfig.jwtRefreshSecret,
    ) as JwtPayload;

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
