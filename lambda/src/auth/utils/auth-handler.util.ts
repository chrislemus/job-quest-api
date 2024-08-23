import jwt from 'jsonwebtoken';
import { appConfig } from '@/common';
import { AuthEventHandler, EventHandler } from '@/common/types';
import { JwtPayload } from '@/auth/types';

const errorRes = {
  statusCode: 401,
  body: JSON.stringify({ message: 'Unauthorized' }),
} as const;

export const authHandler = (cb: AuthEventHandler) => {
  return (async (event, ctx) => {
    let user: JwtPayload;
    try {
      const accessToken = event.headers.Authorization?.split(' ')[1];
      if (!accessToken) throw new Error('No token provided');
      user = jwt.verify(accessToken, appConfig.jwtSecret) as JwtPayload;
    } catch (error) {
      console.error(error);
      return errorRes;
    }

    if (!user) return errorRes;
    const data = await cb(user, event, ctx);
    return data;
  }) as EventHandler;
};
