import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { JwtPayload } from '@app/auth/types';

/** Extracts current authorized user id. */
export const AuthUserId = createParamDecorator(
  (_: undefined, context: ExecutionContext): number => {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as JwtPayload;
    return user.sub;
  },
);
