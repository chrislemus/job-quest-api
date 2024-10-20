import { BuildOpenApiSpecArgOperationObj } from '@/shared';
import { appConfig } from '@/shared';
import { EventHandler } from '@/shared/types';
import { JwtDto } from '@/features/auth/dto';
import jwt from 'jsonwebtoken';
import { getTokens } from '@/features/auth/utils';
import { userDB } from '@/shared/db/user-db.service';
import bcrypt from 'bcryptjs';
import { JwtPayload } from '@/features/auth/types';
import { JobQuestDBService } from '@/core/database';

export const authRefreshJwtHandlerSpec: BuildOpenApiSpecArgOperationObj = {
  responses: {
    200: {
      description: '',
      content: {
        'application/json': {
          zodSchema: { JwtDto },
        },
      },
    },
  },
};

export const authRefreshJwtHandler: EventHandler = async (req) => {
  try {
    const refreshToken = req.headers.Authorization?.split(' ')[1];
    if (!refreshToken) throw new Error('No token provided');
    const payload = jwt.verify(
      refreshToken,
      appConfig.jwtRefreshSecret,
    ) as JwtPayload;

    // const dbUser = await userDB.queryUnique(payload.id);
    const { data: dbUser } = await JobQuestDBService.entities.user
      .get({ userId: payload.id })
      .go();
    if (!dbUser?.refreshToken) throw new Error('User refresh token not found');

    const isMatch = await bcrypt.compare(refreshToken, dbUser.refreshToken);
    if (!isMatch) throw new Error('Refresh token mismatch');

    const tokens = await getTokens(payload);
    const body = tokens;
    return { status: 200, body };
  } catch (error) {
    console.error(error);
    return { status: 401 };
  }
};
