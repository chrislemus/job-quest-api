import jwt from 'jsonwebtoken';
import { appConfig } from '@/common';
import { AuthEventHandler, EventHandler } from '@/common/types';
import { JwtPayload } from '@/auth/types';

export const authHandler = (cb: AuthEventHandler) => {
  return (async (event, ctx) => {
    try {
      const accessToken = event.headers.Authorization?.split(' ')[1];
      if (!accessToken) throw new Error('No token provided');
      const user = jwt.verify(accessToken, appConfig.jwtSecret) as JwtPayload;

      const data = await cb(user, event, ctx);
      return data;
    } catch (error) {
      console.error(error);
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Unauthorized' }),
      };
    }
  }) as EventHandler;
};
