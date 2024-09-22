import jwt from 'jsonwebtoken';
import { appConfig, unauthorizedException } from '@/shared';
import { JwtPayload } from '@/features/auth/types';
import {
  EventHandler,
  Prettify,
  THandlerContext,
  THandlerRequest,
  THandlerResponse,
} from '@/shared/types';

const errorRes = {
  status: 401,
  body: { message: 'Unauthorized' },
} as const;

export const authHandler = (
  cb: (
    req: Prettify<THandlerRequest>,
    ctx: Prettify<THandlerContext & { authUser: JwtPayload }>,
  ) => Promise<Prettify<THandlerResponse>>,
): EventHandler => {
  return (async (req, ctx) => {
    let user: JwtPayload;
    try {
      const accessToken = req.headers.Authorization?.split(' ')[1];
      if (!accessToken) throw unauthorizedException('No token provided');
      user = jwt.verify(accessToken, appConfig.jwtSecret) as JwtPayload;
    } catch (error) {
      console.error(error);
      return errorRes;
    }

    if (!user) return errorRes;
    const data = await cb(req, { ...ctx, authUser: user });
    return data;
  }) as EventHandler;
};
